import { FC } from 'react';

export const ActivityStream: FC = () => {
  const activities = [
    {
      id: '1',
      user: 'Alex Carter',
      action: 'completed task',
      target: 'Initial Requirements Review',
      time: '2 hours ago',
    },
    {
      id: '2',
      user: 'Sarah Chen',
      action: 'commented on',
      target: 'Device Testing Plan',
      time: '4 hours ago',
    },
    {
      id: '3',
      user: 'Mike Johnson',
      action: 'created certification',
      target: 'DARP-127205',
      time: '5 hours ago',
    },
  ];

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              {activity.user.charAt(0)}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-gray-900">
              <span className="font-medium">{activity.user}</span>
              {' '}{activity.action}{' '}
              <span className="font-medium">{activity.target}</span>
            </p>
            <p className="text-sm text-gray-500">{activity.time}</p>
          </div>
        </div>
      ))}
    </div>
  );
};