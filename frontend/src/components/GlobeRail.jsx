// GlobeRail — interactive AIESEC world globe for the feed right rail.
// Three.js r128. OrbitControls imported statically to avoid Vite ESM
// subpath resolution issues in production builds.

import { useEffect, useRef, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { useFeed } from '../lib/queries';
import { timeAgo } from './ui/states';

// ─── AIESEC MC entities: ISO-2 → display name ────────────────────────────────
const AIESEC_ENTITIES = {
  AF:'Afghanistan', AL:'Albania', DZ:'Algeria', AO:'Angola', AR:'Argentina',
  AM:'Armenia', AU:'Australia', AT:'Austria', AZ:'Azerbaijan', BH:'Bahrain',
  BD:'Bangladesh', BY:'Belarus', BE:'Belgium', BJ:'Benin', BO:'Bolivia',
  BA:'Bosnia and Herzegovina', BW:'Botswana', BR:'Brazil', BG:'Bulgaria',
  BF:'Burkina Faso', BI:'Burundi', KH:'Cambodia', CM:'Cameroon', CA:'Canada',
  CF:'Central African Republic', TD:'Chad', CL:'Chile', CN:'China',
  CO:'Colombia', CG:'Congo', CR:'Costa Rica', CI:"Côte d'Ivoire", HR:'Croatia',
  CU:'Cuba', CY:'Cyprus', CZ:'Czechia', CD:'DR Congo', DK:'Denmark',
  DO:'Dominican Republic', EC:'Ecuador', EG:'Egypt', SV:'El Salvador',
  ET:'Ethiopia', FI:'Finland', FR:'France', GE:'Georgia', DE:'Germany',
  GH:'Ghana', GR:'Greece', GT:'Guatemala', GN:'Guinea', HT:'Haiti',
  HN:'Honduras', HK:'Hong Kong', HU:'Hungary', IN:'India', ID:'Indonesia',
  IQ:'Iraq', IE:'Ireland', IL:'Israel', IT:'Italy', JM:'Jamaica', JP:'Japan',
  JO:'Jordan', KZ:'Kazakhstan', KE:'Kenya', KR:'South Korea', KW:'Kuwait',
  KG:'Kyrgyzstan', LA:'Laos', LB:'Lebanon', LR:'Liberia', LY:'Libya',
  MK:'North Macedonia', MG:'Madagascar', MW:'Malawi', MY:'Malaysia',
  ML:'Mali', MT:'Malta', MR:'Mauritania', MX:'Mexico', MD:'Moldova',
  MN:'Mongolia', MA:'Morocco', MZ:'Mozambique', NA:'Namibia', NP:'Nepal',
  NL:'Netherlands', NZ:'New Zealand', NI:'Nicaragua', NE:'Niger',
  NG:'Nigeria', NO:'Norway', OM:'Oman', PK:'Pakistan', PA:'Panama',
  PY:'Paraguay', PE:'Peru', PH:'Philippines', PL:'Poland', PT:'Portugal',
  PR:'Puerto Rico', QA:'Qatar', RO:'Romania', RU:'Russia', RW:'Rwanda',
  SA:'Saudi Arabia', SN:'Senegal', RS:'Serbia', SL:'Sierra Leone',
  SK:'Slovakia', SI:'Slovenia', ZA:'South Africa', SS:'South Sudan',
  ES:'Spain', LK:'Sri Lanka', SD:'Sudan', SE:'Sweden', CH:'Switzerland',
  SY:'Syria', TW:'Taiwan', TJ:'Tajikistan', TZ:'Tanzania', TH:'Thailand',
  TG:'Togo', TN:'Tunisia', TR:'Turkey', UG:'Uganda', UA:'Ukraine',
  AE:'United Arab Emirates', GB:'United Kingdom', US:'United States',
  UY:'Uruguay', UZ:'Uzbekistan', VE:'Venezuela', VN:'Vietnam',
  PS:'Palestine', YE:'Yemen', ZM:'Zambia', ZW:'Zimbabwe',
};

// Numeric topojson country ID → ISO-2
const NUM_TO_ISO = {
  4:'AF',8:'AL',12:'DZ',24:'AO',32:'AR',51:'AM',36:'AU',40:'AT',31:'AZ',
  48:'BH',50:'BD',112:'BY',56:'BE',204:'BJ',68:'BO',70:'BA',72:'BW',76:'BR',
  100:'BG',854:'BF',108:'BI',116:'KH',120:'CM',124:'CA',140:'CF',148:'TD',
  152:'CL',156:'CN',170:'CO',178:'CG',188:'CR',384:'CI',191:'HR',192:'CU',
  196:'CY',203:'CZ',180:'CD',208:'DK',214:'DO',218:'EC',818:'EG',222:'SV',
  231:'ET',246:'FI',250:'FR',268:'GE',276:'DE',288:'GH',300:'GR',320:'GT',
  324:'GN',332:'HT',340:'HN',344:'HK',348:'HU',356:'IN',360:'ID',368:'IQ',
  372:'IE',376:'IL',380:'IT',388:'JM',392:'JP',400:'JO',398:'KZ',404:'KE',
  410:'KR',414:'KW',417:'KG',418:'LA',422:'LB',430:'LR',434:'LY',807:'MK',
  450:'MG',454:'MW',458:'MY',466:'ML',470:'MT',478:'MR',484:'MX',498:'MD',
  496:'MN',504:'MA',508:'MZ',516:'NA',524:'NP',528:'NL',554:'NZ',558:'NI',
  562:'NE',566:'NG',578:'NO',512:'OM',586:'PK',591:'PA',600:'PY',604:'PE',
  608:'PH',616:'PL',620:'PT',630:'PR',634:'QA',642:'RO',643:'RU',646:'RW',
  682:'SA',686:'SN',688:'RS',694:'SL',703:'SK',705:'SI',710:'ZA',728:'SS',
  724:'ES',144:'LK',736:'SD',752:'SE',756:'CH',760:'SY',158:'TW',762:'TJ',
  834:'TZ',764:'TH',768:'TG',788:'TN',792:'TR',800:'UG',804:'UA',784:'AE',
  826:'GB',840:'US',858:'UY',860:'UZ',862:'VE',704:'VN',275:'PS',887:'YE',
  894:'ZM',716:'ZW',
};

function flagEmoji(iso) {
  if (!iso || iso.length !== 2) return '';
  return String.fromCodePoint(
    ...iso.toUpperCase().split('').map(c => 0x1F1E0 - 65 + c.charCodeAt(0))
  );
}

// ─── Country widget ───────────────────────────────────────────────────────────
function CountryWidget({ iso, onClose, posts }) {
  const name = AIESEC_ENTITIES[iso] || iso;
  const flag = flagEmoji(iso);
  const mcPosts = useMemo(() => {
    if (!posts?.length) return [];
    return posts.filter(p =>
      (p.officeCode && p.officeCode.toUpperCase() === iso) ||
      (p.authorOffice && p.authorOffice.toLowerCase().includes(name.toLowerCase().split(' ')[0]))
    ).slice(0, 3);
  }, [posts, iso, name]);

  return (
    <div
      className="absolute z-10 flex flex-col gap-3"
      style={{
        bottom: 16, left: 16, right: 16,
        background: '#fff',
        border: '1px solid var(--line)',
        borderRadius: 10,
        boxShadow: '0 8px 40px -8px rgba(26,34,51,0.22)',
        padding: '18px 18px 14px',
        animation: 'widgetIn 0.18s cubic-bezier(0.22,1,0.36,1)',
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span style={{ fontSize: 26, lineHeight: 1 }}>{flag}</span>
          <div className="flex flex-col gap-0">
            <span className="font-display font-bold text-ink" style={{ fontSize: 15, letterSpacing: '-0.01em' }}>{name}</span>
            <span className="font-mono text-accent-deep" style={{ fontSize: 10, letterSpacing: '0.14em' }}>AIESEC MC · {iso}</span>
          </div>
        </div>
        <button onClick={onClose} className="font-mono text-ink-faint hover:text-ink" style={{ fontSize: 18, lineHeight: 1, padding: '0 4px' }}>×</button>
      </div>

      {mcPosts.length === 0 ? (
        <p className="font-sans text-ink-faint" style={{ fontSize: 12, lineHeight: 1.5, padding: '6px 0 2px' }}>
          This MC hasn't posted anything yet.
        </p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {mcPosts.map(p => (
            <Link
              key={p.id} to={`/feed/${p.id}`}
              className="flex flex-col gap-0.5 no-underline group"
              style={{ padding: '8px 10px', borderRadius: 6, background: 'var(--accent-tint)', border: '1px solid var(--accent-light)' }}
            >
              <span
                className="font-sans font-bold text-ink group-hover:text-accent-deep transition-colors"
                style={{ fontSize: 12, lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
              >
                {p.title}
              </span>
              <div className="flex items-center gap-2 font-mono text-ink-faint" style={{ fontSize: 10, letterSpacing: '0.06em' }}>
                <span>{p.authorName}</span><span>·</span><span>{timeAgo(p.createdAt)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Globe canvas ─────────────────────────────────────────────────────────────
export default function GlobeRail() {
  const mountRef = useRef(null);
  const stateRef = useRef({});
  const [selected, setSelected] = useState(null);
  const [ready, setReady] = useState(false);
  const { data } = useFeed();
  const posts = useMemo(() =>
    Array.isArray(data) ? data : data?.posts ?? data?.content ?? [],
  [data]);

  useEffect(() => {
    let cancelled = false;
    const el = mountRef.current;
    if (!el) return;

    const W = el.clientWidth;
    const H = el.clientHeight;

    // Load world atlas then init Three.js
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      .then(r => r.json())
      .then(worldData => import('topojson-client').then(topojson => ({ worldData, topojson })))
      .then(({ worldData, topojson }) => {
        if (cancelled) return;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(W, H);
        renderer.setClearColor(0x000000, 0);
        el.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 1000);
        camera.position.set(0, 0, 2.6);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.06;
        controls.rotateSpeed = 0.55;
        controls.zoomSpeed = 0.7;
        controls.minDistance = 1.6;
        controls.maxDistance = 4.5;
        controls.enablePan = false;
        controls.object.position.set(0.3, 0.4, 2.5);
        controls.update();

        const R = 1.0;

        // Ocean
        scene.add(new THREE.Mesh(
          new THREE.SphereGeometry(R, 64, 64),
          new THREE.MeshPhongMaterial({ color: 0x037EF3, shininess: 18, specular: new THREE.Color(0x9BC8F8) })
        ));

        // Atmosphere
        scene.add(new THREE.Mesh(
          new THREE.SphereGeometry(R * 1.035, 64, 64),
          new THREE.MeshPhongMaterial({ color: 0x9BC8F8, transparent: true, opacity: 0.13, side: THREE.BackSide })
        ));

        // Lights
        scene.add(new THREE.AmbientLight(0xffffff, 0.55));
        const sun = new THREE.DirectionalLight(0xffffff, 0.9);
        sun.position.set(5, 3, 5);
        scene.add(sun);

        const countries = topojson.feature(worldData, worldData.objects.countries);
        const countryMeshes = [];

        function latlonToVec3(lat, lon, r) {
          const phi   = (90 - lat) * Math.PI / 180;
          const theta = (lon + 180) * Math.PI / 180;
          return new THREE.Vector3(
            -r * Math.sin(phi) * Math.cos(theta),
             r * Math.cos(phi),
             r * Math.sin(phi) * Math.sin(theta),
          );
        }

        countries.features.forEach(f => {
          const iso = NUM_TO_ISO[parseInt(f.id, 10)];
          if (!iso) return;
          const isAiesec = !!AIESEC_ENTITIES[iso];
          const color = isAiesec ? 0xF4F7FB : 0xD0D8E8;
          const mat = new THREE.MeshPhongMaterial({
            color, shininess: isAiesec ? 6 : 2,
            transparent: true, opacity: isAiesec ? 0.96 : 0.55,
          });
          const polys = f.geometry.type === 'Polygon'
            ? [f.geometry.coordinates] : f.geometry.coordinates;
          polys.forEach(poly => {
            poly.forEach(ring => {
              const pts = ring.map(([lon, lat]) => latlonToVec3(lat, lon, R + 0.002));
              if (pts.length < 3) return;
              const verts = [];
              const cx = pts.reduce((s,v)=>s+v.x,0)/pts.length;
              const cy = pts.reduce((s,v)=>s+v.y,0)/pts.length;
              const cz = pts.reduce((s,v)=>s+v.z,0)/pts.length;
              const len = Math.sqrt(cx*cx+cy*cy+cz*cz);
              const center = new THREE.Vector3(cx/len*(R+0.002),cy/len*(R+0.002),cz/len*(R+0.002));
              for (let i=0; i<pts.length-1; i++) {
                verts.push(center.x,center.y,center.z,pts[i].x,pts[i].y,pts[i].z,pts[i+1].x,pts[i+1].y,pts[i+1].z);
              }
              const geo = new THREE.BufferGeometry();
              geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
              geo.computeVertexNormals();
              const mesh = new THREE.Mesh(geo, mat.clone());
              mesh.userData = { iso, isAiesec };
              scene.add(mesh);
              countryMeshes.push({ mesh, iso });
            });
          });
        });

        // Raycaster
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        let isDragging = false;
        let downPos = { x: 0, y: 0 };

        function onDown(e) { downPos = { x: e.clientX, y: e.clientY }; isDragging = false; }
        function onMove(e) {
          const dx = e.clientX - downPos.x, dy = e.clientY - downPos.y;
          if (Math.sqrt(dx*dx+dy*dy) > 4) isDragging = true;
          const rect = renderer.domElement.getBoundingClientRect();
          mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
          mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
          raycaster.setFromCamera(mouse, camera);
          const hits = raycaster.intersectObjects(countryMeshes.map(c=>c.mesh));
          renderer.domElement.style.cursor =
            hits.length && hits[0].object.userData.isAiesec ? 'pointer' : 'grab';
        }
        function onClick(e) {
          if (isDragging) return;
          const rect = renderer.domElement.getBoundingClientRect();
          mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
          mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
          raycaster.setFromCamera(mouse, camera);
          const hits = raycaster.intersectObjects(countryMeshes.map(c=>c.mesh));
          if (!hits.length || !hits[0].object.userData.isAiesec) { setSelected(null); return; }
          const iso = hits[0].object.userData.iso;
          setSelected(prev => prev === iso ? null : iso);
        }

        renderer.domElement.addEventListener('mousedown', onDown);
        renderer.domElement.addEventListener('mousemove', onMove);
        renderer.domElement.addEventListener('click', onClick);

        function updateHighlight(iso) {
          countryMeshes.forEach(({ mesh }) => {
            if (!mesh.userData.isAiesec) return;
            const sel = mesh.userData.iso === iso;
            mesh.material.color.set(sel ? 0xFFFFFF : 0xF4F7FB);
            mesh.material.emissive = new THREE.Color(sel ? 0x037EF3 : 0x000000);
            mesh.material.emissiveIntensity = sel ? 0.25 : 0;
          });
        }
        stateRef.current.updateHighlight = updateHighlight;

        let animId;
        function animate() {
          animId = requestAnimationFrame(animate);
          controls.update();
          renderer.render(scene, camera);
        }
        animate();

        const ro = new ResizeObserver(() => {
          const w = el.clientWidth, h = el.clientHeight;
          camera.aspect = w/h; camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        });
        ro.observe(el);

        setReady(true);

        stateRef.current.cleanup = () => {
          cancelAnimationFrame(animId);
          ro.disconnect();
          renderer.domElement.removeEventListener('mousedown', onDown);
          renderer.domElement.removeEventListener('mousemove', onMove);
          renderer.domElement.removeEventListener('click', onClick);
          renderer.dispose();
          if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
        };
      }).catch(err => console.error('Globe init failed:', err));

    return () => {
      cancelled = true;
      stateRef.current.cleanup?.();
    };
  }, []);

  useEffect(() => {
    stateRef.current.updateHighlight?.(selected);
  }, [selected]);

  return (
    <div className="hidden lg:flex flex-col sticky top-24 self-start" style={{ width: 300, gap: 0 }}>
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono uppercase text-ink-faint" style={{ fontSize: 10, letterSpacing: '0.18em' }}>AIESEC Network</span>
        <span className="inline-flex items-center gap-1.5 font-mono" style={{ fontSize: 10, letterSpacing: '0.12em', color: 'var(--accent-deep)' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--live)', boxShadow: '0 0 0 3px rgba(91,230,154,0.3)', display: 'inline-block' }} />
          {Object.keys(AIESEC_ENTITIES).length} entities
        </span>
      </div>

      <div style={{ position: 'relative', width: '100%', height: 300, borderRadius: 10, overflow: 'hidden', background: 'var(--paper-soft)', border: '1px solid var(--line)' }}>
        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin-slow" style={{ width: 28, height: 28, border: '2px solid var(--accent-light)', borderTopColor: 'var(--accent)', borderRadius: '50%' }} />
              <span className="font-mono text-ink-faint" style={{ fontSize: 10, letterSpacing: '0.12em' }}>loading globe…</span>
            </div>
          </div>
        )}
        <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
        {selected && <CountryWidget iso={selected} posts={posts} onClose={() => setSelected(null)} />}
      </div>

      {!selected && (
        <p className="font-sans text-ink-faint mt-2.5" style={{ fontSize: 11, lineHeight: 1.5 }}>
          Click any <span className="font-bold text-accent-deep">blue country</span> to see its latest stories.
        </p>
      )}

      <style>{`@keyframes widgetIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
}
