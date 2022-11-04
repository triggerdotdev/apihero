export default function ProjectMenu() {
  return (
    <div className="h-full w-full bg-slate-50">
      <nav className="flex flex-col justify-between h-full w-20 bg-white">
        <ul className="flex flex-col">
          <li>Home</li>
          <li>Caching</li>
          <li>Alerts</li>
        </ul>
        <ul>
          <li>Settings</li>
        </ul>
      </nav>
    </div>
  );
}
