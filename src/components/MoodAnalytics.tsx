
import React from "react";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const sampleData = [
  { name: "Happy", value: 12 },
  { name: "Neutral", value: 8 },
  { name: "Sad", value: 4 },
];

const MoodAnalytics = () => {
  return (
    <Card className="p-6 bg-gradient-to-br from-[#9b87f5]/10 to-[#E5DEFF]/30">
      <h3 className="font-semibold text-lg mb-4">Monthly Mood Summary</h3>
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sampleData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#9b87f5" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default MoodAnalytics;
