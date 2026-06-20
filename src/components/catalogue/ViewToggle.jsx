import { Newspaper, Grid, List } from "lucide-react";

export default function ViewToggle({ activeLayout, setActiveLayout }) {
  const modes = [
    { id: "magazine", label: "Magazine", icon: Newspaper },
    { id: "grid", label: "Grille", icon: Grid },
    { id: "list", label: "Liste", icon: List }
  ];

  const handleModeChange = (id) => {
    setActiveLayout(id);
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.setItem("begglire_catalogue_view", id);
    }
  };

  return (
    <div className="flex bg-white/60 border border-primary-soft/10 p-1 rounded-xl shadow-sm items-center space-x-1 select-none">
      {modes.map((mode) => {
        const Icon = mode.icon;
        const isActive = activeLayout === mode.id;

        return (
          <button
            key={mode.id}
            onClick={() => handleModeChange(mode.id)}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-poppins font-bold uppercase tracking-wider transition-all duration-300 ${
              isActive
                ? "bg-[#1c380e] text-white shadow-md"
                : "text-charcoal/70 hover:bg-[#1c380e]/5 hover:text-[#1c380e]"
            }`}
            title={`Affichage ${mode.label}`}
          >
            <Icon size={14} />
            <span className="hidden lg:inline">{mode.label}</span>
          </button>
        );
      })}
    </div>
  );
}
