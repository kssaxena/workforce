import { ClipboardCheck } from "lucide-react";

const Attendance = () => {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8">
      <div className="grid size-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
        <ClipboardCheck size={21} />
      </div>

      <h2 className="mt-5 text-2xl font-black">Attendance</h2>

      <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
        Company-wide attendance monitoring, check-ins, check-outs, late
        arrivals, working hours and attendance history will live here.
      </p>
    </div>
  );
};

export default Attendance;
