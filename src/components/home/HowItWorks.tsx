
import React from 'react';
import { User, Bus as BusIcon, CheckCircle } from 'lucide-react';

const steps = [
  {
    icon: <User size={28} className="text-primary" />,
    title: "Sign Up",
    desc: "Create your profile in seconds."
  },
  {
    icon: <BusIcon size={28} className="text-primary" />,
    title: "Select Trip",
    desc: "Choose your route or get a monthly pass."
  },
  {
    icon: <CheckCircle size={28} className="text-primary" />,
    title: "Ride",
    desc: "Board, scan & travel with ease."
  },
];

const HowItWorks = () => {
  return (
    <div className="mt-8 mb-16 px-1 py-8 bg-white/90 rounded-2xl shadow-md animate-fade-in">
      <h2 className="text-2xl font-bold text-primary text-center mb-8">How it works</h2>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
        {steps.map((step, idx) => (
          <div
            className={`flex flex-col items-center flex-1 max-w-xs transition-all duration-200 animate-fade-in hover:scale-105`}
            style={{ animationDelay: `${idx * 120}ms` }}
            key={idx}
          >
            <div className="w-14 h-14 flex items-center justify-center rounded-full bg-primary/10 mb-3 border border-primary/10">{step.icon}</div>
            <div className="text-xl font-medium text-primary text-center">{step.title}</div>
            <div className="text-muted-foreground text-center">{step.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HowItWorks;
