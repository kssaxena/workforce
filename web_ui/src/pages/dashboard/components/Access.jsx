import { ShieldCheck } from "lucide-react";

const Access = () => {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8">
      <div className="grid size-12 place-items-center rounded-2xl bg-amber-50 text-amber-600">
        <ShieldCheck size={21} />
      </div>

      <h2 className="mt-5 text-2xl font-black">Access & Roles</h2>

      <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
        Manage company roles, permissions and user access across Workforce OS.
      </p>
    </div>
  );
};

export default Access;
