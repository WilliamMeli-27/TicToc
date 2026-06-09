export interface Post {
  id: string;
  imageUrl: string;
  views: number;
}

export interface UserStats {
  followers: number;
  following: number;
  likes: number;
}

export type TabType = 'posts' | 'private' | 'saved';

export const userProfile = {
  username: '@digital_nexus',
  avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBHtUTZaGY__j8Ina02NAFFTc7kqbMIn-OC9xSRiyUm7jShg17lsCNxzV-U5KEYR74G4Z6f3geoYXJ4p15z-QqQD87_vMoulc3sEsyohDgGN_Z08Iw_a87doQUoxKDcqBHG4wNm4tzAaLh8jmZNgJrAgMJBlTC8AtDjni9bQIphgkOeH8B3iWbPXQq5up9AcAG0G3EId3yKYvWRf-NG7YZWXIfA7cjcKSVnRqPGkJzjdLj6NUG1POx_Bt86dsqOe2qU2eTsB0HG3d92',
  bio: 'Creating the future of digital art ⚡️ Visual Architect based in the Grid. Always evolving.',
  stats: {
    followers: 12800,
    following: 482,
    likes: 1200000,
  }
};

export const mockPosts: Post[] = [
  {
    id: '1',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA_1GcroSwghugP4bfX-41EOgD7kgoEdkUTWw4zXRbwwrzL8ONPVAY9GDMfqzfVEp-uZLKP2-Y2J6-t7Txck_CF3wKHx-xMRX7jC-rG73Cx0JdjJYD-FwSL2Z-y-NXAM3Wb1dHtlprfh6FEKLzWWlaELYpY9DLZNOOtWxQ618R9uxqncQSKeBdGzmkIpKi0ugvyO8h2AAqAseUr9w697KgIia0n6f8Di07tugvZ1fUrKgf4n5KKtN6SBZRKQCcSMt3vxj4KPBwiaGvY',
    views: 1200000,
  },
  {
    id: '2',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCnziUdYtRvIjeGd6x6SJnSwPBMgwJAgmP15-wjHJbXoI0ciRx-LeJpDVscw636jgPNuSz8B31tUB2eO7v_ZGMq8Q7HNsBzBTDrjvXhYlASLZQGnaztXT-musbTvfS1jGG0k9v2e_mMS0EyWXkX1MTWLIVioZchIIjQsBYhrfAcCi5ytOJzdQNozaqxoioM4w7YVVb_2t6tN3ZMBaHecLTTB0AxHSsdpA9qaTSudcYsJAYpQXmAivCM52tSQ0d_7oRDJr5KQdKHRNKi',
    views: 856000,
  },
  {
    id: '3',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC7osO5RMsbsADYcmlHKtPi62KjrpBIvOOapmHndRhFnPjGdUyyjljgxbhDf6yQGwVoUvYowYOTikuqvcetecQXVhUC5qXOBjN88o2c51kb89xThvWY5_yCXkbC1iZz4lYh07NG0gyIalTu1sd3m5jiJP5peHHXmlX8ZcZ4T7nL0lnV4PlSK6g2dH8d4Yg3kRiatlokfEgNjZg9g-al_IRViNd-3emKBItFty8IB3EPEDGTVpoEfS8hOLGdwLSV2AU48KY6sDHowFID',
    views: 2400000,
  },
  {
    id: '4',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBlcbgTCUabWIg-bxsHfMkExEH6a_ho-1yK2C9LB8_ejWI5cjo6wl1yCUNL2YvhMFmm2-MDhXr-5ha5IGsXZiynLp9_nSPTVJBZB0ocu_lcpr3d68Jo6h74iZD60hs0Y1JzqzsxQgpQwEVXoCSnx0ws4H-9ELfQEAw-Y2dPNGL5jE3IvcXrfGbLuAUd4m1pBux3c9kVvfywUwKRQuIrV1E3WdjWutc2BlnA4goYPJh3hMnEiy5Uc7Y2jU1gZgmE36zynbZcS8UVbweV',
    views: 92000,
  },
  {
    id: '5',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDDyy6JNdRX2dXfWvM1PlauFcHBihZ06VFDnx951uUUVYpIr-vrOiiT5cSlox7buC2QNF8gh9ekwIyNrZiuXhDZs3qDq9sPKAHp1SsH0Tz5znO6Z-T2qhZVcxKKnLW_ia4R_EMwvMPEgmGYwV95AHuvzkKjmKYYLgmz2jVqb8rJaCXFiJ8hu6Xjou76gr3OyseUDRXsbc4pHcnj9BXp10qxqsxtrw0YPWg_1j5ZKImTtO-bfEY__BFA-j9otEX2EKVcJCBSioEHHzP_',
    views: 310000,
  },
  {
    id: '6',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC3z3JwsJWlj4we2lGlaFPqUU-Wu01dzXqPJyIQSmQEIz9HJa0SaTIYLj8y3JYK88vF7TISNP9IGIlfPR_blgSRn5XgibyUW_EqW60t8wPesMtj2rMH63HeD8DbQmL6UL1013du6ukw_gYTKj30-pScPr34XULd4fLM9KTeWXrPo45KCLxRtyx2a9Mg30keT69CNehkoZQI9PkOZF97YdSrBFei713KSj3fQyeqrdc8e6sJo5VdE1cDXL7RKGQOhmIi8UKA4tDFl8Ql',
    views: 1100000,
  },
];

export const mockPrivatePosts: Post[] = [
  {
    id: 'p1',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA_1GcroSwghugP4bfX-41EOgD7kgoEdkUTWw4zXRbwwrzL8ONPVAY9GDMfqzfVEp-uZLKP2-Y2J6-t7Txck_CF3wKHx-xMRX7jC-rG73Cx0JdjJYD-FwSL2Z-y-NXAM3Wb1dHtlprfh6FEKLzWWlaELYpY9DLZNOOtWxQ618R9uxqncQSKeBdGzmkIpKi0ugvyO8h2AAqAseUr9w697KgIia0n6f8Di07tugvZ1fUrKgf4n5KKtN6SBZRKQCcSMt3vxj4KPBwiaGvY',
    views: 45000,
  },
];

export const mockSavedPosts: Post[] = [
  {
    id: 's1',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCnziUdYtRvIjeGd6x6SJnSwPBMgwJAgmP15-wjHJbXoI0ciRx-LeJpDVscw636jgPNuSz8B31tUB2eO7v_ZGMq8Q7HNsBzBTDrjvXhYlASLZQGnaztXT-musbTvfS1jGG0k9v2e_mMS0EyWXkX1MTWLIVioZchIIjQsBYhrfAcCi5ytOJzdQNozaqxoioM4w7YVVb_2t6tN3ZMBaHecLTTB0AxHSsdpA9qaTSudcYsJAYpQXmAivCM52tSQ0d_7oRDJr5KQdKHRNKi',
    views: 23000,
  },
];