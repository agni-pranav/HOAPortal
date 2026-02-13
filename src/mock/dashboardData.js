export const iconPaths = {
  upcomingEvents: 'M8 2v3M16 2v3M3 9h18M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2',
  openComplaints: 'M21 14a2 2 0 0 1-2 2H8l-5 4V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
  activeVendors: 'M4 20h16M6 20V8l6-4 6 4v12M9 12h6M9 16h6',
  totalMembers: 'M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2M18 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6M7 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6',
  drbApplications: 'M8 3h8M8 3a2 2 0 0 0-2 2v1H5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-1V5a2 2 0 0 0-2-2M9 12h6M9 16h6',
  planningItems: 'M12 3a9 9 0 1 0 9 9 9 9 0 0 0-9-9m0 4a5 5 0 1 1-5 5 5 5 0 0 1 5-5m0 3.5v3l2.2 1.3',
  activeProjects: 'M3 7h7l2 2h9v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
  publishedNewsletters: 'M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM3 8l9 6 9-6',
  calendar: 'M8 2v3M16 2v3M3 9h18M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2',
  meeting: 'M8 2v3M16 2v3M3 9h18M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2M8 13h8',
  newsletter: 'M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM3 8l9 6 9-6',
  vendors: 'M4 20h16M6 20V8l6-4 6 4v12M9 12h6M9 16h6',
  complaint: 'M21 14a2 2 0 0 1-2 2H8l-5 4V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'
}

export const dashboardStats = [
  {
    label: 'Upcoming Events',
    value: '5',
    hint: 'Next: Board Meeting on Jan 15',
    icon: 'upcomingEvents'
  },
  {
    label: 'Open Complaints',
    value: '4',
    hint: '2 require immediate attention',
    icon: 'openComplaints'
  },
  {
    label: 'Active Vendors',
    value: '3',
    hint: '1 contract expiring soon',
    icon: 'activeVendors'
  },
  {
    label: 'Total Members',
    value: '4',
    hint: 'All roles represented',
    icon: 'totalMembers'
  },
  {
    label: 'DRB Applications',
    value: '4',
    hint: '2 pending review',
    icon: 'drbApplications'
  },
  {
    label: 'Planning Items',
    value: '11',
    hint: '3 active periods',
    icon: 'planningItems'
  },
  {
    label: 'Active Projects',
    value: '4',
    hint: '2 in progress',
    icon: 'activeProjects'
  },
  {
    label: 'Published Newsletters',
    value: '2',
    hint: '85% average open rate',
    icon: 'publishedNewsletters'
  }
]

export const recentActivity = [
  {
    id: 1,
    title: 'January newsletter published',
    time: '2 hours ago',
    type: 'info'
  },
  {
    id: 2,
    title: 'Pool renovation project completed',
    time: '5 hours ago',
    type: 'success'
  },
  {
    id: 3,
    title: 'New complaint submitted',
    time: '1 day ago',
    type: 'warning'
  }
]

export const quickActions = [
  {
    id: 'view-calendar',
    label: 'View Calendar',
    icon: 'calendar'
  },
  {
    id: 'schedule-meeting',
    label: 'Schedule Meeting',
    icon: 'meeting'
  },
  {
    id: 'create-newsletter',
    label: 'Create Newsletter',
    icon: 'newsletter'
  },
  {
    id: 'manage-vendors',
    label: 'Manage Vendors',
    icon: 'vendors'
  },
  {
    id: 'review-complaints',
    label: 'Review Complaints',
    icon: 'complaint'
  }
]
