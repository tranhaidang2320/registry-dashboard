export default function ThemeScript() {
  const script = `(function(){try{var t=localStorage.getItem('registry-theme')||'system';var e=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';var r=t==='system'?e:t;document.documentElement.classList.toggle('dark',r==='dark');}catch(e){}})();`
  return <script dangerouslySetInnerHTML={{ __html: script }} />
}
