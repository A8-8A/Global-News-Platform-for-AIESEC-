// Back-compat shim. The old codebase imported brand marks from
// components/Brand. Re-export the new ui/ implementations so any stray
// import keeps working.
export { Logo, HumanMark } from './ui/Logo';
export { Avatar } from './ui/Avatar';
