import React from 'react';
import { Fir, Complaint, Evidence, Investigation } from '../types';
import { Printer, Download, X, Shield, FileText, CheckCircle } from 'lucide-react';

interface FirPrintModalProps {
  fir: Fir;
  complaint?: Complaint;
  investigation?: Investigation;
  evidenceList?: Evidence[];
  onClose: () => void;
}

export const FirPrintModal: React.FC<FirPrintModalProps> = ({
  fir,
  complaint,
  investigation,
  evidenceList = [],
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Top Control Bar */}
        <div className="no-print flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-900" />
            <h3 className="font-semibold text-slate-900">
              Official First Information Report (FIR) Docket · {fir.id}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-900 rounded hover:bg-blue-800 transition"
            >
              <Printer className="w-4 h-4" />
              Print / Save as PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Police Document Body */}
        <div className="overflow-y-auto p-8 print-page bg-white font-sans text-slate-900">
          {/* Header */}
          <div className="text-center border-b-2 border-slate-900 pb-5 mb-6">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Shield className="w-10 h-10 text-slate-900" />
              <div>
                <h1 className="text-xl font-bold tracking-wide uppercase">
                  State Police Department · Criminal Investigation Wing
                </h1>
                <p className="text-xs uppercase tracking-widest text-slate-600">
                  First Information Report (Under Section 154 Cr.P.C. / Sec 173 BNSS)
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-500 font-mono">
              FIRNEXA · Centralized Digital FIR Record Repository System · Automated Reference Docket
            </p>
          </div>

          {/* Core Identification Meta Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 border border-slate-300 rounded mb-6 text-xs">
            <div>
              <span className="text-slate-500 block uppercase font-mono text-[10px]">FIR Number</span>
              <strong className="text-sm font-mono text-blue-950">{fir.id}</strong>
            </div>
            <div>
              <span className="text-slate-500 block uppercase font-mono text-[10px]">Police Station</span>
              <strong className="text-sm text-slate-900">{fir.policeStation}</strong>
            </div>
            <div>
              <span className="text-slate-500 block uppercase font-mono text-[10px]">Registration Date</span>
              <span className="font-mono">{new Date(fir.registrationDate).toLocaleDateString()}</span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase font-mono text-[10px]">Status</span>
              <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-blue-900 border border-blue-200">
                {fir.status}
              </span>
            </div>
          </div>

          {/* Section 1: Complainant / Informant Details */}
          <div className="mb-6">
            <h4 className="text-xs font-bold uppercase tracking-wider bg-slate-200 px-3 py-1.5 text-slate-800 mb-3 border-l-4 border-slate-900">
              1. Complainant / Informant Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block">Full Name:</span>
                <span className="font-semibold text-slate-900">{fir.citizenName}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Contact Phone:</span>
                <span className="font-mono text-slate-900">{fir.citizenPhone}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Linked Complaint Ref:</span>
                <span className="font-mono text-blue-800">{fir.complaintId || 'Direct Station Register'}</span>
              </div>
              <div className="col-span-full">
                <span className="text-slate-500 block">Present Address:</span>
                <span className="text-slate-800">{fir.citizenAddress}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Details of Occurrence */}
          <div className="mb-6">
            <h4 className="text-xs font-bold uppercase tracking-wider bg-slate-200 px-3 py-1.5 text-slate-800 mb-3 border-l-4 border-slate-900">
              2. Details of Known Occurrence
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs mb-3">
              <div>
                <span className="text-slate-500 block">Date of Incident:</span>
                <span className="font-medium text-slate-900">{fir.incidentDate}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Time of Incident:</span>
                <span className="font-medium text-slate-900">{fir.incidentTime}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Offence Category:</span>
                <span className="font-semibold text-slate-900">{fir.offenceType}</span>
              </div>
            </div>
            <div className="text-xs mb-2">
              <span className="text-slate-500 block">Place of Occurrence & Landmarks:</span>
              <span className="font-medium text-slate-800">{fir.incidentLocation}</span>
            </div>
            <div className="text-xs p-2.5 bg-amber-50/50 border border-amber-200 rounded">
              <span className="text-slate-700 block font-semibold">Acts and Legal Sections Applied:</span>
              <span className="font-mono text-slate-900">{fir.actAndSections}</span>
            </div>
          </div>

          {/* Section 3: Substance of Information / Complaint Narrative */}
          <div className="mb-6">
            <h4 className="text-xs font-bold uppercase tracking-wider bg-slate-200 px-3 py-1.5 text-slate-800 mb-2 border-l-4 border-slate-900">
              3. Substance of First Information Received
            </h4>
            <div className="text-xs text-slate-800 leading-relaxed p-3 border border-slate-200 rounded bg-slate-50/40">
              {fir.description}
            </div>
            {complaint?.suspectDetails && (
              <div className="mt-2 text-xs p-2 bg-slate-50 border border-slate-200 rounded">
                <span className="font-semibold text-slate-700">Suspect Particulars: </span>
                <span className="text-slate-800">{complaint.suspectDetails}</span>
              </div>
            )}
          </div>

          {/* Section 4: Investigating Officer & Station Details */}
          <div className="mb-6">
            <h4 className="text-xs font-bold uppercase tracking-wider bg-slate-200 px-3 py-1.5 text-slate-800 mb-3 border-l-4 border-slate-900">
              4. Investigating Officer (I.O.) Assignment
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block">Officer Name:</span>
                <span className="font-semibold text-slate-900">{fir.investigatingOfficerName}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Designation / Rank:</span>
                <span className="text-slate-800">{fir.investigatingOfficerRank}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Station Precinct:</span>
                <span className="text-slate-800">{fir.policeStation}</span>
              </div>
            </div>
          </div>

          {/* Section 5: Attached Evidence Ledger */}
          {evidenceList.length > 0 && (
            <div className="mb-6">
              <h4 className="text-xs font-bold uppercase tracking-wider bg-slate-200 px-3 py-1.5 text-slate-800 mb-2 border-l-4 border-slate-900">
                5. Registered Physical / Digital Evidence Log ({evidenceList.length} items)
              </h4>
              <table className="w-full text-[11px] border border-slate-200 text-left">
                <thead className="bg-slate-100 border-b border-slate-200 font-semibold text-slate-700">
                  <tr>
                    <th className="p-1.5">Evidence ID</th>
                    <th className="p-1.5">Type</th>
                    <th className="p-1.5">Description</th>
                    <th className="p-1.5">Collected By</th>
                    <th className="p-1.5">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  {evidenceList.map((e) => (
                    <tr key={e.id}>
                      <td className="p-1.5 font-mono text-blue-900">{e.id}</td>
                      <td className="p-1.5 font-medium">{e.evidenceType}</td>
                      <td className="p-1.5">{e.description}</td>
                      <td className="p-1.5">{e.collectedBy}</td>
                      <td className="p-1.5 font-mono">{e.collectedDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Signature & Seal Footer */}
          <div className="mt-12 pt-8 border-t border-slate-300 grid grid-cols-2 gap-8 text-center text-xs">
            <div className="flex flex-col items-center justify-end">
              <div className="w-48 border-b border-slate-400 mb-2 pb-1 text-slate-400 italic">
                {fir.citizenName}
              </div>
              <span className="font-semibold text-slate-800">Signature / Thumb Impression of Informant</span>
              <span className="text-[10px] text-slate-500">Free Copy Provided under Sec 154(2) Cr.P.C.</span>
            </div>

            <div className="flex flex-col items-center justify-end">
              <div className="w-48 border-b border-slate-400 mb-2 pb-1 font-mono font-medium text-slate-800">
                {fir.investigatingOfficerName}
              </div>
              <span className="font-semibold text-slate-800">Officer-in-Charge / Investigating Officer</span>
              <span className="text-[10px] text-slate-500">{fir.policeStation}</span>
            </div>
          </div>

          <div className="mt-8 text-center text-[10px] text-slate-400 border-t border-dashed border-slate-200 pt-3">
            FIRNEXA System Generated FIR Document · Digitally Authenticated on {new Date().toLocaleString()} · Official Criminal Records Repository
          </div>
        </div>
      </div>
    </div>
  );
};
