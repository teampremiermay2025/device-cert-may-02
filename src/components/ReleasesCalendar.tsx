import React, { useMemo, useEffect, useState } from 'react';
import { storage } from '../lib/storage';
import { CertificationRequest } from '../types';
import {
  CalendarIcon,
  RocketLaunchIcon,
} from '@heroicons/react/24/outline';

interface Release {
  id: string;
  projectName: string;
  forecastedLaunchDate: string;
}

interface Certification {
  id: string;
  projectName: string;
  forecastedLaunchDate: string;
  // Other fields as needed
}

// Helper for grouping releases by date
function groupByDate(releases: Release[]) {
  const map: { [date: string]: Release[] } = {};
  releases.forEach(release => {
    if (release.forecastedLaunchDate) {
      const date = new Date(release.forecastedLaunchDate);
      const key = date.toISOString().slice(0, 10);
      if (!map[key]) map[key] = [];
      map[key].push(release);
    }
  });
  return map;
}

const getMonthMatrix = (year: number, month: number) => {
  // month: 0-indexed
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const matrix: (Date | null)[][] = [];
  let week: (Date | null)[] = [];
  let day = new Date(firstDay);
  // Fill leading blanks
  for (let i = 0; i < firstDay.getDay(); i++) week.push(null);
  while (day <= lastDay) {
    week.push(new Date(day));
    if (week.length === 7) {
      matrix.push(week);
      week = [];
    }
    day.setDate(day.getDate() + 1);
  }
  // Fill trailing blanks
  while (week.length && week.length < 7) week.push(null);
  if (week.length) matrix.push(week);
  return matrix;
};

export const ReleasesCalendar: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [releases, setReleases] = useState<Release[]>([]);
  const [releasesByDate, setReleasesByDate] = useState<{ [key: string]: Release[] }>({});

  useEffect(() => {
    // Read certifications from local storage
    const certificationsData = localStorage.getItem('certifications');
    if (certificationsData) {
      const certifications = JSON.parse(certificationsData) as Certification[];
      const formattedReleases = certifications
        .filter(cert => cert.forecastedLaunchDate)
        .map(cert => ({
          id: cert.id,
          projectName: cert.projectName,
          forecastedLaunchDate: cert.forecastedLaunchDate,
        }));
      setReleases(formattedReleases);
    }
  }, []);

  useEffect(() => {
    const releasesByDate = groupByDate(releases);
    setReleasesByDate(releasesByDate);
  }, [releases]);

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(y => y - 1);
    } else {
      setSelectedMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(y => y + 1);
    } else {
      setSelectedMonth(m => m + 1);
    }
  };

  const monthMatrix = useMemo(() => getMonthMatrix(selectedYear, selectedMonth), [selectedYear, selectedMonth]);
  const monthName = new Date(selectedYear, selectedMonth).toLocaleString('default', { month: 'long' });

  return (
    <div className="p-8 bg-gradient-to-tr from-blue-50 to-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-extrabold text-blue-900 drop-shadow flex items-center gap-2">
          <CalendarIcon className="w-8 h-8 text-blue-400" /> Releases Calendar
        </h1>
        <div className="flex items-center gap-2">
          <button onClick={handlePrevMonth} className="px-3 py-1 rounded bg-white border shadow hover:bg-blue-50 text-blue-700 font-bold">{'<'}</button>
          <span className="text-lg font-bold text-blue-900 mx-2">{monthName} {selectedYear}</span>
          <button onClick={handleNextMonth} className="px-3 py-1 rounded bg-white border shadow hover:bg-blue-50 text-blue-700 font-bold">{'>'}</button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-[700px] w-full bg-white rounded-2xl shadow-lg border">
          <thead>
            <tr>
              {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
                <th key={d} className="py-2 px-2 text-xs font-bold text-blue-700 text-center bg-blue-50">{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {monthMatrix.map((week, i) => (
              <tr key={i}>
                {week.map((date, j) => {
                  const key = date ? date.toISOString().slice(0, 10) : `empty-${i}-${j}`;
                  const dayReleases = date ? releasesByDate[key] || [] : [];
                  return (
                    <td key={key} className={
                      `h-24 align-top border-t border-gray-100 px-2 py-2 relative ` +
                      (date ? 'bg-white' : 'bg-blue-50')
                    }>
                      {date && (
                        <div className={`text-xs font-bold mb-1 ${date.getMonth() === selectedMonth ? 'text-blue-900' : 'text-gray-300'}`}>{date.getDate()}</div>
                      )}
                      <div className="space-y-1">
                        {dayReleases.map(rel => (
                          <div
                            key={rel.id}
                            className="flex items-center gap-1 bg-gradient-to-r from-blue-100 to-blue-50 border border-blue-200 rounded px-2 py-1 shadow-sm hover:shadow-md cursor-pointer group"
                            title={rel.projectName}
                          >
                            <RocketLaunchIcon className="w-4 h-4 text-blue-400 mr-1" />
                            <span className="font-semibold text-xs text-blue-900 truncate max-w-[100px] group-hover:text-blue-700 transition" title={rel.projectName}>{rel.projectName}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReleasesCalendar;
