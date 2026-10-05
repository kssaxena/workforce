import { Wallet } from "lucide-react";

const Payroll = () => {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8">
      <div className="grid size-12 place-items-center rounded-2xl bg-violet-50 text-violet-600">
        <Wallet size={21} />
      </div>

      <h2 className="mt-5 text-2xl font-black">Payroll</h2>

      <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
        Payroll processing, salary calculations, allowances, deductions,
        reimbursements and payslips will be managed here.
      </p>
    </div>
  );
};

export default Payroll;
