import Image from "next/image";

export const metadata = {
  title: "DriveGuard | Check Challan, Fines & Traffic Rules India",
  description:
    "Check traffic fines in India including red light jump, overspeeding, no license, and required documents. Get instant challan help and penalty details.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0B0B0C] text-white px-6 py-10 max-w-5xl mx-auto">

      <div className="flex items-center gap-4 mb-10">
        <Image
          src="/driveguard-logo.png"
          alt="DriveGuard Logo"
          width={56}
          height={56}
          className="rounded-full object-contain"
        />
        <div>
          <h1 className="text-3xl font-bold">
            <span className="text-white">Drive</span>
            <span className="text-emerald-400">Guard</span>
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">AI-powered Traffic Fine Assistant · India</p>
        </div>
      </div>

      <p className="text-gray-300 mb-6 leading-relaxed">
        DriveGuard is a smart tool designed to help drivers in India understand
        traffic rules, challan fines, and required documents. Whether you were
        stopped by traffic police or just want to stay compliant, DriveGuard
        gives you clear and accurate answers instantly.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-3">
        Common Traffic Violations in India
      </h2>
      <ul className="list-disc pl-6 text-gray-300 space-y-2 leading-relaxed">
        <li>Red light jumping fine in India</li>
        <li>Driving without license penalty</li>
        <li>No seatbelt challan rules</li>
        <li>Overspeeding fine and limits</li>
        <li>Driving without insurance fine</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-10 mb-3">
        Why Use DriveGuard?
      </h2>
      <p className="text-gray-300 leading-relaxed">
        Instead of searching multiple websites or confusing legal pages,
        DriveGuard gives you quick, accurate, and easy-to-understand information
        about fines, penalties, and traffic laws across India.
      </p>

      <h2 className="text-2xl font-semibold mt-10 mb-3">
        Documents You Must Carry While Driving
      </h2>
      <ul className="list-disc pl-6 text-gray-300 space-y-2 leading-relaxed">
        <li>Driving License (DL)</li>
        <li>RC (Registration Certificate)</li>
        <li>Vehicle Insurance</li>
        <li>PUC Certificate</li>
        <li>Road Tax Receipt</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-10 mb-3">
        Check Your Traffic Fine Easily
      </h2>
      <p className="text-gray-300 leading-relaxed">
        Use DriveGuard to quickly check your traffic fine, understand challan
        rules, and avoid unnecessary penalties. Stay informed and drive safely.
      </p>

    </div>
  );
}
