export interface VideoPost {
  id: string;
  username: string;
  avatar: string;
  videoUrl: string;
  thumbnail: string;
  description: string;
  hashtags: string[];
  musicTitle: string;
  likes: number;
  comments: number;
  bookmarks: number;
  shares: number;
  isLiked: boolean;
  isBookmarked: boolean;
}

export const mockPosts: VideoPost[] = [
  {
    id: '1',
    username: '@alex_vortex',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCiMT3z1X1YcHiQPHmrt3MbL8paWgoMCkYH_R_aVx4BF-K-FeizyWuUAivrYzIWUq0LhdXkym8VxZaOisUXm9XKUgij-SPIW0IfouNmG-z2m9xjec7k7LRz-E-CQD9GHoU1LIHgT-9vIz4M-gqt9_g7E7qybL7b-P8yH8zJux7UoxP0mEM68VpPi8AOMZ-lC7FzCZhhrvtkLDO26FwIl31zuq4Nb6EFLhgJ_LUorwuSiM5GMFSfaBcXLLYOTaTZjKdG_xc6M6RHcFko',
    videoUrl: '',
    thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCukzIkDe7K5dSI5PFjsnOlB43vfWTS7dhQg9SXXj3HleXiuJec_W3Mt8NC6DziahxUVOI-TEP6u894SMxAPfVjXvkI-Fut2sfNmWYxFTXwVB4Ir9UU92qa-tV2p_VktxxHB_lY2rqCieLk-E9lh3WZAbR7SmtzFQIVkqhPk7YEA4-1ouaayypoUB2imsb3ORO_3zJSD_MkBrFTK-dXeKEvyTbrWi-RIWzFDgKKK2OTvAQ0qY44mhNTcmXsam6VzzG3fDhYWMyMO-4G',
    description: 'Synthesizing the future one beat at a time. This new setup is insane! ⚡️',
    hashtags: ['#cyberpunk', '#digitalpulse', '#creators'],
    musicTitle: 'Neon Dreams (Original Mix) - Alex Vortex feat. Synthia',
    likes: 142800,
    comments: 842,
    bookmarks: 12500,
    shares: 6200,
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: '2',
    username: '@tech_minimal',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCM9jVPWq3jXyYTvCVpXe1tG_0JP9I93XHkJn8Rnfc5mj7MBBTN9jv2skpNMIKV3x3FvgIlMce9ErKZwYsv1eAvH7fBgeSbsruk0V5PixIY0HM5cjcvcuaPKNjkzITz-nI_AdYY-ZbAqOaJxantdpfpkfrw8CfhNLN0wgAeOjTeinQ1he7UROA6Ejy4xkNRJHKFeVOfPbPpDRzA8iKlGXB7DP5TuSDt0jNdrtKy-KcQ6UFtXxWqvAumHylkCqLkDY9XaAjfoOd6PxPe',
    videoUrl: '',
    thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAE4nFNKmDBPNgFKXVX0qrS0DseIaQWE1xkSZekEvhN5dtF2Ty1oDNRHIWjUbUMVNxACdZGgoU2NWnUFhpJ7SHX-Lioh2LAXpQWcwmg4R0aZ5wkktZHLSczsCuKjYX1BszVVgKPP59su-r0_MrOG7L4ca_F0sovTeU8ToZtlzbyad21xUguP2usoi8qfDBsNSSIWsovQAAxYiXFYX0AbeslNvZlqoZNM4YnKPUk35cxjnNdelXh1ngoHwFGnw3scMVrt4DX1K0gO1hx',
    description: 'Ultimate dev setup for 2024.',
    hashtags: ['#minimalist', '#coding', '#workspace'],
    musicTitle: '',
    likes: 45600,
    comments: 234,
    bookmarks: 8900,
    shares: 2100,
    isLiked: false,
    isBookmarked: false,
  },
];

export interface VideoSlideProps {
  post: VideoPost;
  onLike: (id: string) => void;
  onBookmark: (id: string) => void;
  onShare: (id: string) => void;
  onComment: (id: string) => void;
  onFollow: (username: string) => void;
}