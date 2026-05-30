// GlobeRail — interactive AIESEC world globe for the feed right rail.
//
// Real Earth texture from Three.js r128 repo (same version we bundle).
// MeshBasicMaterial = no lighting, no sun shading, just the texture.
// AIESEC MC entities get a glowing dot at their lat/lon.
// Click a dot → country widget. Widget always shows even with no posts.

import { useEffect, useRef, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { useFeed } from '../lib/queries';
import { timeAgo } from './ui/states';

const EARTH_TEXTURE =
  'https://raw.githubusercontent.com/mrdoob/three.js/r128/examples/textures/land_ocean_ice_cloud_2048.jpg';

// ─── AIESEC MC entities ───────────────────────────────────────────────────────
const ENTITIES = {
  AF:{n:'Afghanistan',lat:33.9,lon:67.7},   AL:{n:'Albania',lat:41.2,lon:20.2},
  DZ:{n:'Algeria',lat:28.0,lon:1.7},        AO:{n:'Angola',lat:-11.2,lon:17.9},
  AR:{n:'Argentina',lat:-38.4,lon:-63.6},   AM:{n:'Armenia',lat:40.1,lon:45.0},
  AU:{n:'Australia',lat:-25.3,lon:133.8},   AT:{n:'Austria',lat:47.5,lon:14.6},
  AZ:{n:'Azerbaijan',lat:40.1,lon:47.6},    BH:{n:'Bahrain',lat:26.0,lon:50.6},
  BD:{n:'Bangladesh',lat:23.7,lon:90.4},    BY:{n:'Belarus',lat:53.7,lon:28.0},
  BE:{n:'Belgium',lat:50.5,lon:4.5},        BJ:{n:'Benin',lat:9.3,lon:2.3},
  BO:{n:'Bolivia',lat:-16.3,lon:-63.6},     BA:{n:'Bosnia',lat:43.9,lon:17.7},
  BW:{n:'Botswana',lat:-22.3,lon:24.7},     BR:{n:'Brazil',lat:-14.2,lon:-51.9},
  BG:{n:'Bulgaria',lat:42.7,lon:25.5},      BF:{n:'Burkina Faso',lat:12.4,lon:-1.6},
  KH:{n:'Cambodia',lat:12.6,lon:104.9},     CM:{n:'Cameroon',lat:3.8,lon:11.5},
  CA:{n:'Canada',lat:56.1,lon:-106.3},      CL:{n:'Chile',lat:-35.7,lon:-71.5},
  CN:{n:'China',lat:35.9,lon:104.2},        CO:{n:'Colombia',lat:4.6,lon:-74.3},
  CR:{n:'Costa Rica',lat:9.7,lon:-83.8},    CI:{n:"Côte d'Ivoire",lat:7.5,lon:-5.5},
  HR:{n:'Croatia',lat:45.1,lon:15.2},       CY:{n:'Cyprus',lat:35.1,lon:33.4},
  CZ:{n:'Czechia',lat:49.8,lon:15.5},       DK:{n:'Denmark',lat:56.3,lon:9.5},
  DO:{n:'Dominican Rep.',lat:18.7,lon:-70.2}, EC:{n:'Ecuador',lat:-1.8,lon:-78.2},
  EG:{n:'Egypt',lat:26.8,lon:30.8},         SV:{n:'El Salvador',lat:13.8,lon:-88.9},
  ET:{n:'Ethiopia',lat:9.1,lon:40.5},       FI:{n:'Finland',lat:64.0,lon:25.7},
  FR:{n:'France',lat:46.2,lon:2.2},         GE:{n:'Georgia',lat:42.3,lon:43.4},
  DE:{n:'Germany',lat:51.2,lon:10.5},       GH:{n:'Ghana',lat:7.9,lon:-1.0},
  GR:{n:'Greece',lat:39.1,lon:21.8},        GT:{n:'Guatemala',lat:15.8,lon:-90.2},
  HT:{n:'Haiti',lat:18.9,lon:-72.3},        HN:{n:'Honduras',lat:15.2,lon:-86.2},
  HK:{n:'Hong Kong',lat:22.3,lon:114.2},    HU:{n:'Hungary',lat:47.2,lon:19.5},
  IN:{n:'India',lat:20.6,lon:79.1},         ID:{n:'Indonesia',lat:-0.8,lon:113.9},
  IE:{n:'Ireland',lat:53.4,lon:-8.2},       IT:{n:'Italy',lat:41.9,lon:12.6},
  JM:{n:'Jamaica',lat:18.1,lon:-77.3},      JP:{n:'Japan',lat:36.2,lon:138.3},
  JO:{n:'Jordan',lat:30.6,lon:36.2},        KZ:{n:'Kazakhstan',lat:48.0,lon:66.9},
  KE:{n:'Kenya',lat:-0.0,lon:37.9},         KR:{n:'South Korea',lat:35.9,lon:127.8},
  KW:{n:'Kuwait',lat:29.3,lon:47.5},        KG:{n:'Kyrgyzstan',lat:41.2,lon:74.8},
  LA:{n:'Laos',lat:19.9,lon:102.5},         LB:{n:'Lebanon',lat:33.9,lon:35.9},
  LR:{n:'Liberia',lat:6.4,lon:-9.4},        MK:{n:'N. Macedonia',lat:41.6,lon:21.7},
  MG:{n:'Madagascar',lat:-18.8,lon:46.9},   MW:{n:'Malawi',lat:-13.3,lon:34.3},
  MY:{n:'Malaysia',lat:4.2,lon:108.0},      ML:{n:'Mali',lat:17.6,lon:-2.0},
  MT:{n:'Malta',lat:35.9,lon:14.5},         MX:{n:'Mexico',lat:23.6,lon:-102.6},
  MD:{n:'Moldova',lat:47.4,lon:28.4},       MN:{n:'Mongolia',lat:46.9,lon:103.8},
  MA:{n:'Morocco',lat:31.8,lon:-7.1},       MZ:{n:'Mozambique',lat:-18.7,lon:35.5},
  NA:{n:'Namibia',lat:-22.9,lon:18.5},      NP:{n:'Nepal',lat:28.4,lon:84.1},
  NL:{n:'Netherlands',lat:52.1,lon:5.3},    NZ:{n:'New Zealand',lat:-40.9,lon:174.9},
  NI:{n:'Nicaragua',lat:12.9,lon:-85.2},    NE:{n:'Niger',lat:17.6,lon:8.1},
  NG:{n:'Nigeria',lat:9.1,lon:8.7},         NO:{n:'Norway',lat:60.5,lon:8.5},
  OM:{n:'Oman',lat:21.5,lon:55.9},          PK:{n:'Pakistan',lat:30.4,lon:69.3},
  PA:{n:'Panama',lat:8.5,lon:-80.8},        PY:{n:'Paraguay',lat:-23.4,lon:-58.4},
  PE:{n:'Peru',lat:-9.2,lon:-75.0},         PH:{n:'Philippines',lat:12.9,lon:121.8},
  PL:{n:'Poland',lat:52.1,lon:19.1},        PT:{n:'Portugal',lat:39.4,lon:-8.2},
  QA:{n:'Qatar',lat:25.4,lon:51.2},         RO:{n:'Romania',lat:45.9,lon:24.9},
  RU:{n:'Russia',lat:61.5,lon:105.3},       RW:{n:'Rwanda',lat:-1.9,lon:29.9},
  SA:{n:'Saudi Arabia',lat:23.9,lon:45.1},  SN:{n:'Senegal',lat:14.5,lon:-14.5},
  RS:{n:'Serbia',lat:44.0,lon:21.0},        SL:{n:'Sierra Leone',lat:8.5,lon:-11.8},
  SK:{n:'Slovakia',lat:48.7,lon:19.7},      SI:{n:'Slovenia',lat:46.2,lon:15.0},
  ZA:{n:'South Africa',lat:-30.6,lon:22.9}, ES:{n:'Spain',lat:40.5,lon:-3.7},
  LK:{n:'Sri Lanka',lat:7.9,lon:80.8},      SE:{n:'Sweden',lat:60.1,lon:18.6},
  CH:{n:'Switzerland',lat:46.8,lon:8.2},    TW:{n:'Taiwan',lat:23.7,lon:121.0},
  TJ:{n:'Tajikistan',lat:38.9,lon:71.3},    TZ:{n:'Tanzania',lat:-6.4,lon:34.9},
  TH:{n:'Thailand',lat:15.9,lon:100.9},     TG:{n:'Togo',lat:8.6,lon:0.8},
  TN:{n:'Tunisia',lat:33.9,lon:9.5},        TR:{n:'Turkey',lat:38.9,lon:35.2},
  UG:{n:'Uganda',lat:1.4,lon:32.3},         UA:{n:'Ukraine',lat:48.4,lon:31.2},
  AE:{n:'UAE',lat:23.4,lon:53.8},           GB:{n:'United Kingdom',lat:55.4,lon:-3.4},
  US:{n:'United States',lat:37.1,lon:-95.7},UY:{n:'Uruguay',lat:-32.5,lon:-55.8},
  UZ:{n:'Uzbekistan',lat:41.4,lon:64.6},    VE:{n:'Venezuela',lat:6.4,lon:-66.6},
  VN:{n:'Vietnam',lat:14.1,lon:108.3},      YE:{n:'Yemen',lat:15.6,lon:48.5},
  ZM:{n:'Zambia',lat:-13.1,lon:27.8},       ZW:{n:'Zimbabwe',lat:-19.0,lon:29.2},
};

function flagEmoji(iso) {
  if (!iso || iso.length !== 2) return '';
  return String.fromCodePoint(
    ...iso.toUpperCase().split('').map(c => 0x1F1E0 - 65 + c.charCodeAt(0))
  );
}

function latLonToVec3(lat, lon, r) {
  const phi   = (90 - lat)  * Math.PI / 180;
  const theta = (lon + 180) * Math.PI / 180;
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
     r * Math.cos(phi),
     r * Math.sin(phi) * Math.sin(theta),
  );
}

// ─── Widget — always shown when a dot is clicked ──────────────────────────────
function CountryWidget({ iso, onClose, posts }) {
  const entity = ENTITIES[iso];
  const name   = entity?.n || iso;
  const flag   = flagEmoji(iso);

  const mcPosts = useMemo(() => {
    if (!posts?.length) return [];
    return posts.filter(p =>
      (p.officeCode && p.officeCode.toUpperCase() === iso) ||
      (p.authorOffice && p.authorOffice.toLowerCase()
        .includes(name.toLowerCase().split(' ')[0]))
    ).slice(0, 3);
  }, [posts, iso, name]);

  return (
    <div
      className="absolute z-10 flex flex-col gap-3"
      style={{
        bottom: 12, left: 12, right: 12,
        background: '#fff',
        border: '1px solid var(--line)',
        borderRadius: 10,
        boxShadow: '0 8px 40px -8px rgba(26,34,51,0.28)',
        padding: '16px 16px 12px',
        animation: 'widgetIn 0.18s cubic-bezier(0.22,1,0.36,1)',
      }}
    >
      {/* header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 22, lineHeight: 1 }}>{flag}</span>
          <div>
            <div className="font-sans font-bold text-ink" style={{ fontSize: 13, lineHeight: 1.2 }}>{name}</div>
            <div className="font-mono text-accent-deep" style={{ fontSize: 9, letterSpacing: '0.14em' }}>AIESEC MC · {iso}</div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-ink-faint hover:text-ink font-sans"
          style={{ fontSize: 18, lineHeight: 1, padding: '2px 6px', background: 'var(--paper-soft)', borderRadius: 4 }}
        >×</button>
      </div>

      {/* posts — always rendered, empty state if none */}
      <div className="flex flex-col gap-1.5">
        {mcPosts.length === 0 ? (
          <div
            className="font-sans text-ink-faint text-center"
            style={{ fontSize: 12, padding: '10px 0', lineHeight: 1.5 }}
          >
            This MC hasn't posted anything yet.
          </div>
        ) : (
          mcPosts.map(p => (
            <Link
              key={p.id}
              to={`/feed/${p.id}`}
              className="flex flex-col gap-0.5 no-underline group"
              style={{
                padding: '7px 9px',
                borderRadius: 6,
                background: 'var(--accent-tint)',
                border: '1px solid var(--accent-light)',
              }}
            >
              <span
                className="font-sans font-bold text-ink group-hover:text-accent-deep transition-colors"
                style={{
                  fontSize: 11, lineHeight: 1.3,
                  display: '-webkit-box', WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}
              >
                {p.title}
              </span>
              <div className="flex items-center gap-1.5 font-mono text-ink-faint" style={{ fontSize: 9, letterSpacing: '0.06em' }}>
                <span>{p.authorName}</span>
                <span>·</span>
                <span>{timeAgo(p.createdAt)}</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

// ─── Globe ────────────────────────────────────────────────────────────────────
export default function GlobeRail() {
  const mountRef  = useRef(null);
  const stateRef  = useRef({});
  const [selected, setSelected] = useState(null);
  const [ready,    setReady]    = useState(false);
  const { data } = useFeed();
  const posts = useMemo(() =>
    Array.isArray(data) ? data : data?.posts ?? data?.content ?? [],
  [data]);

  // Keep posts ref fresh so the click handler inside useEffect always
  // reads the latest value without needing to re-run the effect.
  const postsRef = useRef(posts);
  useEffect(() => { postsRef.current = posts; }, [posts]);

  useEffect(() => {
    let cancelled = false;
    const el = mountRef.current;
    if (!el) return;

    const W = el.clientWidth  || 300;
    const H = el.clientHeight || 300;

    // ── Renderer ──────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);

    // ── Scene / camera ────────────────────────────────────────────
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 1000);
    camera.position.set(0, 0, 2.8);

    // ── Controls ──────────────────────────────────────────────────
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.rotateSpeed   = 0.55;
    controls.zoomSpeed     = 0.7;
    controls.minDistance   = 1.8;
    controls.maxDistance   = 4.5;
    controls.enablePan     = false;
    controls.update();

    const R = 1.0;

    // ── Earth sphere — texture, no lighting ───────────────────────
    const earthGeo = new THREE.SphereGeometry(R, 64, 64);
    const earthMat = new THREE.MeshBasicMaterial({ color: 0x1a3a5c });
    const earth    = new THREE.Mesh(earthGeo, earthMat);
    scene.add(earth);

    new THREE.TextureLoader().load(
      EARTH_TEXTURE,
      (tex) => {
        if (cancelled) return;
        earthMat.map   = tex;
        earthMat.color = new THREE.Color(0xffffff);
        earthMat.needsUpdate = true;
        setReady(true);
      },
      undefined,
      () => { if (!cancelled) setReady(true); } // fallback: show dark blue
    );

    // ── Atmosphere (subtle, no light needed) ──────────────────────
    scene.add(new THREE.Mesh(
      new THREE.SphereGeometry(R * 1.03, 64, 64),
      new THREE.MeshBasicMaterial({ color: 0x9BC8F8, transparent: true, opacity: 0.07, side: THREE.BackSide })
    ));

    // ── Entity dots ───────────────────────────────────────────────
    // Larger dots (r=0.028) so they're easy to click. Each dot is its
    // own mesh so raycasting is simple and reliable.
    const dotMeshes = [];
    const dotGeo    = new THREE.SphereGeometry(0.028, 8, 8);

    Object.entries(ENTITIES).forEach(([iso, { lat, lon }]) => {
      const mat  = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const mesh = new THREE.Mesh(dotGeo, mat);
      mesh.position.copy(latLonToVec3(lat, lon, R + 0.015));
      mesh.userData.iso = iso;
      scene.add(mesh);
      dotMeshes.push(mesh);
    });

    // ── Raycaster ─────────────────────────────────────────────────
    const raycaster = new THREE.Raycaster();
    const mouse     = new THREE.Vector2();
    let pointerMoved = false;
    let downX = 0, downY = 0;

    function getMouseNDC(e) {
      const rect = renderer.domElement.getBoundingClientRect();
      return {
        x:  ((e.clientX - rect.left) / rect.width)  * 2 - 1,
        y: -((e.clientY - rect.top)  / rect.height) * 2 + 1,
      };
    }

    function onPointerDown(e) {
      downX = e.clientX; downY = e.clientY;
      pointerMoved = false;
    }
    function onPointerMove(e) {
      const dx = e.clientX - downX, dy = e.clientY - downY;
      if (Math.sqrt(dx*dx + dy*dy) > 5) pointerMoved = true;
      // update cursor
      const { x, y } = getMouseNDC(e);
      mouse.set(x, y);
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(dotMeshes);
      renderer.domElement.style.cursor = hits.length ? 'pointer' : 'grab';
    }
    function onPointerUp(e) {
      if (pointerMoved) return; // was a drag, not a click
      const { x, y } = getMouseNDC(e);
      mouse.set(x, y);
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(dotMeshes);
      if (!hits.length) {
        setSelected(null);
        return;
      }
      const iso = hits[0].object.userData.iso;
      setSelected(prev => prev === iso ? null : iso);
    }

    // Use pointerdown/up instead of mousedown/click to avoid
    // OrbitControls stealing the event on short drags.
    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('pointerup',   onPointerUp);

    // ── Highlight ─────────────────────────────────────────────────
    function updateHighlight(iso) {
      dotMeshes.forEach(mesh => {
        const sel = mesh.userData.iso === iso;
        mesh.material.color.set(sel ? 0x037EF3 : 0xffffff);
        mesh.scale.setScalar(sel ? 1.8 : 1.0);
      });
    }
    stateRef.current.updateHighlight = updateHighlight;

    // ── Animate ───────────────────────────────────────────────────
    let animId;
    (function animate() {
      animId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    })();

    // ── Resize ────────────────────────────────────────────────────
    const ro = new ResizeObserver(() => {
      const w = el.clientWidth, h = el.clientHeight;
      if (!w || !h) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    ro.observe(el);

    stateRef.current.cleanup = () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('pointerup',   onPointerUp);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };

    return () => {
      cancelled = true;
      stateRef.current.cleanup?.();
    };
  }, []);

  // Sync highlight whenever selection changes
  useEffect(() => {
    stateRef.current.updateHighlight?.(selected);
  }, [selected]);

  return (
    <div className="hidden lg:flex flex-col sticky top-24 self-start" style={{ width: 300 }}>
      {/* label */}
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono uppercase text-ink-faint" style={{ fontSize: 10, letterSpacing: '0.18em' }}>
          AIESEC Network
        </span>
        <span className="inline-flex items-center gap-1.5 font-mono" style={{ fontSize: 10, letterSpacing: '0.12em', color: 'var(--accent-deep)' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--live)', boxShadow: '0 0 0 3px rgba(91,230,154,0.3)', display: 'inline-block' }} />
          {Object.keys(ENTITIES).length} entities
        </span>
      </div>

      {/* globe */}
      <div style={{
        position: 'relative', width: '100%', height: 300,
        borderRadius: 10, overflow: 'hidden',
        background: '#0a1628',
        border: '1px solid var(--line)',
      }}>
        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center flex-col gap-2">
            <div style={{ width: 28, height: 28, border: '2px solid rgba(255,255,255,0.15)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <span style={{ fontSize: 10, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>loading earth…</span>
          </div>
        )}
        <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
        {selected && (
          <CountryWidget
            iso={selected}
            posts={posts}
            onClose={() => setSelected(null)}
          />
        )}
      </div>

      {/* hint */}
      <p className="font-sans text-ink-faint mt-2.5" style={{ fontSize: 11, lineHeight: 1.5 }}>
        {selected
          ? null
          : <>Click any <span className="font-bold text-ink">white dot</span> to see stories from that entity.</>
        }
      </p>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes widgetIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
