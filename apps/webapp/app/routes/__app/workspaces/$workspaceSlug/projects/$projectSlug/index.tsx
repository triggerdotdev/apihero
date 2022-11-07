export default function ProjectMenu() {
  return (
    <nav className="flex flex-col justify-between border-r border-slate-200 h-full w-20 bg-white">
      <ul className="flex flex-col">
        <li>Home</li>
        <li>Caching</li>
        <li>Alerts</li>
      </ul>
      <ul>
        <li>Settings</li>
      </ul>
    </nav>
  );
}
