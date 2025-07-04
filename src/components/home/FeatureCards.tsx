
import React from 'react';
import { Calendar, MapPin, ClipboardCheck } from 'lucide-react';

const featureCards = [
  {
    icon: <Calendar size={32} className="text-primary" />,
    title: "Monthly Pass",
    desc: "Unlimited city rides with a digital monthly pass. Never stand in lines again."
  },
  {
    icon: <MapPin size={32} className="text-primary" />,
    title: "Live Tracking",
    desc: "Track your bus in real time and plan stress-free journeys from anywhere."
  },
  {
    icon: <ClipboardCheck size={32} className="text-primary" />,
    title: "Your Tickets",
    desc: "Access and manage your bookings anytime—no paper needed."
  },
];

const FeatureCards = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12 animate-fade-in">
      {featureCards.map((feat, idx) => (
        <div
          className="bg-white border border-primary/20 p-6 rounded-xl text-center shadow-lg hover:scale-105 transition-all duration-300 flex flex-col items-center gap-3 animate-scale-in"
          key={idx}
          style={{ animationDelay: `${idx * 120}ms` }}
        >
          <div className="mb-2">{feat.icon}</div>
          <h3 className="text-lg font-semibold text-primary">{feat.title}</h3>
          <p className="text-muted-foreground">{feat.desc}</p>
        </div>
      ))}
    </div>
  );
};

export default FeatureCards;
