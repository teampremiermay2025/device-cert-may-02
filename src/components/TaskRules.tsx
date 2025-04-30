import React, { useEffect, useState } from 'react';
import ruleset from '../data/ruleset.json';
import { getDevicesByType, getAllDevices, DeviceItem } from '../data/devices';

interface RuleSet {
  chapter: string;
  deliverable: string;
  requirement_tag: string;
  issue_types: string[];
  device_channels: string[];
  device: string;
  stage: string;
  [key: string]: any;
}

const getUnique = (arr: string[]) => Array.from(new Set(arr.filter(Boolean))).sort();

const emptyRule: RuleSet = {
  chapter: '',
  deliverable: '',
  requirement_tag: '',
  issue_types: [],
  device_channels: [],
  device: '',
  stage: '',
};

export const TaskRules: React.FC = () => {
  const [rules, setRules] = useState<RuleSet[]>([]);
  const [filter, setFilter] = useState({
    issue_type: '',
    device_channel: '',
    stage: '',
  });
  const [filtered, setFiltered] = useState<RuleSet[]>([]);
  const [hasSelected, setHasSelected] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRule, setNewRule] = useState<RuleSet>(emptyRule);

  const [iotDevices, setIotDevices] = useState<DeviceItem[]>([]);
  const [nonIotDevices, setNonIotDevices] = useState<DeviceItem[]>([]);

  useEffect(() => {
    setRules(Array.isArray(ruleset) ? ruleset : []);
    const { iot, nonIot } = getDevicesByType();
    setIotDevices(iot);
    setNonIotDevices(nonIot);
  }, []);

  useEffect(() => {
    const hasAny = Object.values(filter).some(v => v);
    setHasSelected(hasAny);
    let result = rules;
    if (filter.issue_type) {
      result = result.filter(r => r.issue_types.includes(filter.issue_type));
    }
    if (filter.device_channel) {
      result = result.filter(r => r.device_channels.includes(filter.device_channel));
    }
    if (filter.stage) {
      result = result.filter(r => r.stage === filter.stage);
    }
    setFiltered(result);
  }, [filter, rules]);

  const allIssueTypes = getUnique(rules.flatMap(r => r.issue_types || []));
  const allStages = getUnique(rules.map(r => r.stage));
  const allDeviceChannels = getUnique(rules.flatMap(r => r.device_channels || []));

  const handleClear = () => {
    setFilter({ issue_type: '', device_channel: '', stage: '' });
  };

  const handleAddRule = () => {
    setRules(prev => [...prev, newRule]);
    setShowAddModal(false);
    setNewRule(emptyRule);
  };

  const handleChange = (field: keyof RuleSet, value: string) => {
    if (field === 'issue_types' || field === 'device_channels') {
      setNewRule(r => ({ ...r, [field]: value.split(',').map(s => s.trim()).filter(Boolean) }));
    } else {
      setNewRule(r => ({ ...r, [field]: value }));
    }
  };

  return (
    <div className="p-2 sm:p-4 w-full mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-blue-900">Task Rules</h1>
      <div className="flex flex-col sm:flex-row justify-end items-center mb-4 gap-2">
        <button
          className="inline-flex items-center justify-center px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition font-semibold text-base w-full sm:w-auto"
          onClick={() => setShowAddModal(true)}
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
          Add Task Rule
        </button>
      </div>
      {/* Quick Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <label className="block text-xs font-semibold mb-1">Issue Type</label>
          <select
            className="border rounded p-2 w-full"
            value={filter.issue_type}
            onChange={e => setFilter(f => ({ ...f, issue_type: e.target.value }))}
          >
            <option value="">All</option>
            {allIssueTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-xs font-semibold mb-1">Device Channel</label>
          <select
            className="border rounded p-2 w-full"
            value={filter.device_channel || ''}
            onChange={e => setFilter(f => ({ ...f, device_channel: e.target.value }))}
          >
            <option value="">All</option>
            {allDeviceChannels.map(channel => (
              <option key={channel} value={channel}>{channel}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-xs font-semibold mb-1">Stage</label>
          <select
            className="border rounded p-2 w-full"
            value={filter.stage}
            onChange={e => setFilter(f => ({ ...f, stage: e.target.value }))}
          >
            <option value="">All</option>
            {allStages.map(stage => (
              <option key={stage} value={stage}>{stage}</option>
            ))}
          </select>
        </div>
      </div>
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg mx-auto relative animate-fadeIn">
            <h3 className="text-xl font-bold mb-4 text-blue-800">Add New Task Rule</h3>
            <div className="grid grid-cols-1 gap-3">
              <input className="border rounded p-2" placeholder="Chapter" value={newRule.chapter} onChange={e => handleChange('chapter', e.target.value)} />
              <input className="border rounded p-2" placeholder="Deliverable" value={newRule.deliverable} onChange={e => handleChange('deliverable', e.target.value)} />
              <input className="border rounded p-2" placeholder="Requirement Tag" value={newRule.requirement_tag} onChange={e => handleChange('requirement_tag', e.target.value)} />
              <input className="border rounded p-2" placeholder="Issue Types (comma separated)" value={newRule.issue_types.join(', ')} onChange={e => handleChange('issue_types', e.target.value)} />
              <input className="border rounded p-2" placeholder="Device Channels (comma separated)" value={newRule.device_channels.join(', ')} onChange={e => handleChange('device_channels', e.target.value)} />
              <input className="border rounded p-2" placeholder="Device" value={newRule.device} onChange={e => handleChange('device', e.target.value)} />
              <input className="border rounded p-2" placeholder="Stage" value={newRule.stage} onChange={e => handleChange('stage', e.target.value)} />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 font-semibold" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button
                className="px-5 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 font-semibold shadow"
                onClick={handleAddRule}
                disabled={Object.values(newRule).some(v => (Array.isArray(v) ? v.length === 0 : !v))}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-8 items-start w-full">
        <div className="w-full">
          <div className="overflow-x-auto rounded-2xl shadow-xl border border-blue-100 bg-white w-full">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-900 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 border-b font-bold whitespace-nowrap">Chapter</th>
                  <th className="px-4 py-3 border-b font-bold whitespace-nowrap">Deliverable</th>
                  <th className="px-4 py-3 border-b font-bold whitespace-nowrap">Requirement Tag</th>
                  <th className="px-4 py-3 border-b font-bold whitespace-nowrap">Issue Types</th>
                  <th className="px-4 py-3 border-b font-bold whitespace-nowrap">Device Channels</th>
                  <th className="px-4 py-3 border-b font-bold whitespace-nowrap">Device</th>
                  <th className="px-4 py-3 border-b font-bold whitespace-nowrap">Stage</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-gray-400 italic">No rules available.</td>
                  </tr>
                )}
                {filtered.map((rule, idx) => (
                  <tr
                    key={idx}
                    className={
                      idx % 2 === 0
                        ? 'bg-blue-50 hover:bg-blue-100 transition'
                        : 'bg-white hover:bg-blue-50 transition'
                    }
                  >
                    <td className="border-b px-4 py-2 rounded-l-xl whitespace-nowrap">{rule.chapter}</td>
                    <td className="border-b px-4 py-2 whitespace-nowrap">{rule.deliverable}</td>
                    <td className="border-b px-4 py-2 whitespace-nowrap">{rule.requirement_tag}</td>
                    <td className="border-b px-4 py-2 whitespace-nowrap">{Array.isArray(rule.issue_types) ? rule.issue_types.join(', ') : rule.issue_types}</td>
                    <td className="border-b px-4 py-2 whitespace-nowrap">{Array.isArray(rule.device_channels) ? rule.device_channels.join(', ') : rule.device_channels}</td>
                    <td className="border-b px-4 py-2 whitespace-nowrap">{rule.device}</td>
                    <td className="border-b px-4 py-2 rounded-r-xl whitespace-nowrap">{rule.stage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskRules;
