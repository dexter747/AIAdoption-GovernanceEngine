"use client";

import { useState } from 'react';
import { Calculator, TrendingUp, Clock, DollarSign, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

export default function ROICalculator() {
 const [employees, setEmployees] = useState(50);
 const [hourlyRate, setHourlyRate] = useState(75);
 const [hoursPerWeek, setHoursPerWeek] = useState(10);

 // Calculate savings
 const weeklySavings = employees * hoursPerWeek * hourlyRate * 0.7; // 70% time saved
 const monthlySavings = weeklySavings * 4;
 const yearlySavings = monthlySavings * 12;
 const yearlyROI = ((yearlySavings - (49 * 12 * employees)) / (49 * 12 * employees)) * 100;

 return (
 <section className="py-20 bg-background">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="roi-header text-center mb-12">
 <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-6 bg-blue-950 border-blue-800">
 <Calculator className="w-4 h-4 text-blue-500" />
 <span className="font-medium text-blue-400">
 ROI Calculator
 </span>
 </div>
 <h2 className="sm:text-5xl font-medium mb-4 text-white">
 Calculate Your Potential Savings
 </h2>
 <p className="max-w-3xl mx-auto text-muted-foreground">
 See how much time and money your team could save by querying legacy systems with AI
 </p>
 </div>

 <div className="grid lg:grid-cols-2 gap-8">
 {/* Calculator Inputs */}
 <Card className="roi-calculator">
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <Users className="w-5 h-5 text-blue-600" />
 Your Organization
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-6">
 <div>
 <label className="block font-medium mb-2 text-gray-300">
 Number of Employees Querying Data
 </label>
 <div className="flex items-center gap-4">
 <input
 type="range"
 min="10"
 max="500"
 value={employees}
 onChange={(e) => setEmployees(Number(e.target.value))}
 className="flex-1 h-2 rounded-lg appearance-none cursor-pointer bg-gray-700"
 />
 <span className="text-2xl font-medium text-blue-600 min-w-[80px] text-right">
 {employees}
 </span>
 </div>
 </div>

 <div>
 <label className="block font-medium mb-2 text-gray-300">
 Average Hourly Rate ($)
 </label>
 <div className="flex items-center gap-4">
 <input
 type="range"
 min="30"
 max="250"
 step="5"
 value={hourlyRate}
 onChange={(e) => setHourlyRate(Number(e.target.value))}
 className="flex-1 h-2 rounded-lg appearance-none cursor-pointer bg-gray-700"
 />
 <span className="text-2xl font-medium text-blue-600 min-w-[80px] text-right">
 ${hourlyRate}
 </span>
 </div>
 </div>

 <div>
 <label className="block font-medium mb-2 text-gray-300">
 Hours Spent on Data Queries per Week
 </label>
 <div className="flex items-center gap-4">
 <input
 type="range"
 min="1"
 max="40"
 value={hoursPerWeek}
 onChange={(e) => setHoursPerWeek(Number(e.target.value))}
 className="flex-1 h-2 rounded-lg appearance-none cursor-pointer bg-gray-700"
 />
 <span className="text-2xl font-medium text-blue-600 min-w-[80px] text-right">
 {hoursPerWeek}h
 </span>
 </div>
 </div>

 <div className="pt-4 border-t border-gray-700">
 <p className="text-muted-foreground">
 Based on industry averages, Velanova can reduce query time by{' '}
 <span className="font-medium text-blue-600">70%</span>
 </p>
 </div>
 </CardContent>
 </Card>

 {/* Results */}
 <div className="roi-results space-y-4">
 <Card className="bg-blue-950/30 border-blue-800">
 <CardHeader>
 <CardTitle className="flex items-center gap-2 text-white">
 <DollarSign className="w-5 h-5" />
 Projected Annual Savings
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="text-5xl font-medium text-blue-500 mb-2">
 ${yearlySavings.toLocaleString('en-US')}
 </div>
 <p className="text-muted-foreground">
 ${monthlySavings.toLocaleString('en-US')}/month · ${weeklySavings.toLocaleString('en-US')}/week
 </p>
 </CardContent>
 </Card>

 <Card className="bg-gray-900 border-gray-800">
 <CardHeader>
 <CardTitle className="flex items-center gap-2 text-white">
 <Clock className="w-5 h-5" />
 Time Saved
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="text-5xl font-medium text-blue-500 mb-2">
 {(employees * hoursPerWeek * 52 * 0.7).toLocaleString('en-US')}h
 </div>
 <p className="text-muted-foreground">
 Per year across your entire team
 </p>
 </CardContent>
 </Card>

 <Card className="bg-gray-900 border-gray-800">
 <CardHeader>
 <CardTitle className="flex items-center gap-2 text-white">
 <TrendingUp className="w-5 h-5" />
 Return on Investment
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="text-5xl font-medium text-blue-500 mb-2">
 {yearlyROI > 0 ? yearlyROI.toFixed(0) : '0'}%
 </div>
 <p className="text-muted-foreground">
 ROI in the first 12 months
 </p>
 </CardContent>
 </Card>

 <div className="rounded-xl p-6 bg-gray-800">
 <h4 className="font-medium mb-2 text-white">
 Ready to unlock these savings?
 </h4>
 <p className="mb-4 text-muted-foreground">
 Start with a free 14-day trial. No credit card required.
 </p>
 <button className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors">
 Start Free Trial
 </button>
 </div>
 </div>
 </div>
 </div>
 </section>
 );
}
