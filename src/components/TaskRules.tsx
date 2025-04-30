import React, { useEffect, useState } from 'react';
import ruleset from '../data/ruleset.json';

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
    device: '',
  });
  const [filtered, setFiltered] = useState<RuleSet[]>([]);
  const [hasSelected, setHasSelected] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRule, setNewRule] = useState<RuleSet>(emptyRule);

  useEffect(() => {
    setRules(Array.isArray(ruleset) ? ruleset : []);
  }, []);

  // Try Out filter logic (separate from grid)
  useEffect(() => {
    const hasAny = Object.values(filter).some(v => v);
    setHasSelected(hasAny);
    if (!hasAny) {
      setFiltered([]);
      return;
    }
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
    if (filter.device) {
      result = result.filter(r => r.device === filter.device);
    }
    setFiltered(result);
  }, [filter, rules]);

  // Collect all unique filter values
  const allIssueTypes = getUnique(rules.flatMap(r => r.issue_types || []));
  const allDeviceChannels = getUnique(rules.flatMap(r => r.device_channels || []));
  const allStages = getUnique(rules.map(r => r.stage));
  const allDevices = getUnique(rules.map(r => r.device));

  const handleClear = () => {
    setFilter({ issue_type: '', device_channel: '', stage: '', device: '' });
  };

  // Add Rule Modal Logic
  const handleAddRule = () => {
    setRules(prev => [...prev, newRule]);
    setShowAddModal(false);
    setNewRule(emptyRule);
  };

  const handleChange = (field: keyof RuleSet, value: string) => {
    // For multi-value fields, split by comma and trim
    if (field === 'issue_types' || field === 'device_channels') {
      setNewRule(r => ({ ...r, [field]: value.split(',').map(s => s.trim()).filter(Boolean) }));
    } else {
      setNewRule(r => ({ ...r, [field]: value }));
    }
  };

  return (
    <div className="p-2 sm:p-4 w-full mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-blue-900">Task Rules</h1>
      {/* Add Button */}
      <div className="flex flex-col sm:flex-row justify-end items-center mb-4 gap-2">
        <button
          className="inline-flex items-center justify-center px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition font-semibold text-base w-full sm:w-auto"
          onClick={() => setShowAddModal(true)}
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
          Add Task Rule
        </button>
      </div>
      {/* Modal for Add Task Rule */}
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
        {/* Data Grid on the left, now 2/3 width */}
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
                {rules.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-gray-400 italic">No rules available.</td>
                  </tr>
                )}
                {rules.map((rule, idx) => (
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
        {/* Try Out Section on the right, now 1/3 width and expands */}
        <div className="w-full">
          <div className="bg-gradient-to-tr from-blue-50 to-blue-100 rounded-2xl shadow-lg p-4 sm:p-8 flex flex-col items-center w-full border border-blue-200 relative">
            <h2 className="text-2xl font-semibold mb-4 text-blue-800">🎯 Try Out Quick Filters</h2>
            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4 sm:gap-5 w-full mb-4">
              <select
                className="border-2 border-blue-200 rounded-lg p-2 min-w-[160px] focus:ring-2 focus:ring-blue-300 w-full sm:w-auto"
                value={filter.issue_type}
                onChange={e => setFilter(f => ({ ...f, issue_type: e.target.value }))}
              >
                <option value="">Issue Type</option>
                {allIssueTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <select
                className="border-2 border-blue-200 rounded-lg p-2 min-w-[160px] focus:ring-2 focus:ring-blue-300 w-full sm:w-auto"
                value={filter.device_channel}
                onChange={e => setFilter(f => ({ ...f, device_channel: e.target.value }))}
              >
                <option value="">Device Channel</option>
                {allDeviceChannels.map(channel => (
                  <option key={channel} value={channel}>{channel}</option>
                ))}
              </select>
              <select
                className="border-2 border-blue-200 rounded-lg p-2 min-w-[160px] focus:ring-2 focus:ring-blue-300 w-full sm:w-auto"
                value={filter.stage}
                onChange={e => setFilter(f => ({ ...f, stage: e.target.value }))}
              >
                <option value="">Stage</option>
                {allStages.map(stage => (
                  <option key={stage} value={stage}>{stage}</option>
                ))}
              </select>
              <select
                className="border-2 border-blue-200 rounded-lg p-2 min-w-[160px] focus:ring-2 focus:ring-blue-300 w-full sm:w-auto"
                value={filter.device}
                onChange={e => setFilter(f => ({ ...f, device: e.target.value }))}
              >
                <option value="">Device</option>
                {allDevices.map(device => (
                  <option key={device} value={device}>{device}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-4 mt-2">
              <button
                className="px-5 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition font-semibold"
                onClick={handleClear}
                type="button"
                disabled={!hasSelected}
              >
                Clear Filters
              </button>
            </div>
            <div className="mt-6 w-full text-center">
              {!hasSelected && (
                <span className="text-gray-400 italic">Select at least one filter to see rules...</span>
              )}
              {hasSelected && filtered.length === 0 && (
                <span className="text-blue-500 italic">No rules found for selected criteria.</span>
              )}
              {hasSelected && filtered.length > 0 && (
                <div className="grid grid-cols-1 gap-5 mt-4">
                  {filtered.map((rule, idx) => (
                    <div key={idx} className="bg-white border border-blue-200 rounded-xl shadow p-5 flex flex-col items-start hover:shadow-lg transition w-full">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg font-bold text-blue-800">{rule.deliverable}</span>
                        <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700 font-semibold">{rule.stage}</span>
                      </div>
                      <div className="text-sm text-gray-500 mb-1"><span className="font-semibold">Chapter:</span> {rule.chapter}</div>
                      <div className="text-sm text-gray-500 mb-1"><span className="font-semibold">Requirement:</span> {rule.requirement_tag}</div>
                      <div className="text-xs text-blue-600 mb-1"><span className="font-semibold">Issue Types:</span> {Array.isArray(rule.issue_types) ? rule.issue_types.join(', ') : rule.issue_types}</div>
                      <div className="text-xs text-blue-600 mb-1"><span className="font-semibold">Device Channels:</span> {Array.isArray(rule.device_channels) ? rule.device_channels.join(', ') : rule.device_channels}</div>
                      <div className="text-xs text-blue-600"><span className="font-semibold">Device:</span> {rule.device}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskRules;
