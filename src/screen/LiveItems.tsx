export interface Comment {
  id: string;
  username: string;
  text: string;
  isTopFan?: boolean;
  isSystem?: boolean;
  timestamp: Date;
}

export interface Reaction {
  id: string;
  icon: string;
  color: string;
  x: number;
}

export const REACTION_ICONS = [
  { icon: '❤️', color: '#ff4b89', name: 'heart' },
  { icon: '🔥', color: '#ff9500', name: 'fire' },
  { icon: '✨', color: '#a2ef00', name: 'sparkle' },
  { icon: '🎉', color: '#00f0ff', name: 'celebration' },
];

export const hostInfoMock = {
  username: 'Cyber_Kira',
  followers: '14.2k followers',
  avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBPNwgkfniCLaqPQVImMSIkr0cq8wBYogpspyV1iWI1RqnS5Ku_XqfEkMFFvr0oAfcXhAWT19fjpUk7eoZ5RX6S0gfoTY3_IE21tEveTH_fZU5d-Y743sUEpvbLCtPi_HmWn4PX2tPANEN8b8WlIBWTeJxyuJyuh17DvZZutHZ3rPptW8qAWd2Z7zxXYH6enTQ4_q3KkfBhc8x2KFF5_K45mQJ8SqZd5I8yddLUdR6UJwbDLjxatv7STk9VabwvCb1gqSjFtaV-H013'
};

export const mockComments: Comment[] = [
  {
    id: '1',
    username: 'NeonRider',
    text: 'The visuals are absolutely insane tonight!! 🔥✨',
    isTopFan: true,
    timestamp: new Date(),
  },
  {
    id: '2',
    username: 'Digital_Dreamer',
    text: 'Where did you get that headset?? Looks unreal.',
    timestamp: new Date(),
  },
  {
    id: '3',
    username: 'System_Admin',
    text: 'Kira just reached 10k likes this stream! Keep it going!',
    isSystem: true,
    timestamp: new Date(),
  },
];