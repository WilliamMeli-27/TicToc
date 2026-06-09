export interface Notification {
  id: string;
  type: 'like' | 'follow' | 'comment' | 'mention' | 'system';
  username?: string;
  userAvatar?: string;
  userCount?: number;
  content?: string;
  timestamp: string;
  thumbnail?: string;
  isRead?: boolean;
}

export interface FilterType {
  id: string;
  label: string;
  icon: string;
  activeColor: string;
  activeBgColor: string;
}

export const filters: FilterType[] = [
  { id: 'likes', label: 'Likes', icon: '\u2764\uFE0F', activeColor: '#ffb1c3', activeBgColor: '#ffb1c3' },
  { id: 'comments', label: 'Comments', icon: '\uD83D\uDCAC', activeColor: '#00f0ff', activeBgColor: '#00f0ff' },
  { id: 'followers', label: 'Followers', icon: '\uD83D\uDC64', activeColor: '#a2ef00', activeBgColor: '#a2ef00' },
  { id: 'mentions', label: 'Mentions', icon: '@', activeColor: '#7df4ff', activeBgColor: '#7df4ff' },
];

export const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'like',
    username: 'Leo.Studio',
    userAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDV4yXKAgZDqOHnT52IsBr1-EJXPjYHMpj5Eq8Mt1jQKqK7Y0kxceeDRal0rOL2km5VZfyuml53zzM7a54Xe-_m5Arq7uYUvgobIBx_PbZb0VZ32eDQFTUn68hi4MI_R7s0Y8nJWP5_siivR4YNV8Ykl2Vj7mx0RzhTP_deGjjO9AZw6hWZjfzRs8K18Z7N3w9wIQjzCJe5FiHAHZWI4MGUkS4H5vCff7cijJ7hCvPdtVYbncPa5yWLr2df3OJnqQKnumB6riOrb7qz',
    content: 'liked your video',
    timestamp: '2h',
    thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBXwqDu6gT4Av3GENXFznNinmv8xQDFhzCwyjEhi6TQefWMDyyctR4yz4bKkT3HIa1Z7mOindlwpx9vnUbru7P4KhN_1gBFewHKKzXzTwF91AFn0DFyf8NT9V94jnmJenh_HO3Mwy0o4x0tzpTl3Ua7mY2tFTatjkO7TYx1NsGgNMTxGGPL2zWUOtWI4hXAhdeFHGde7mlwbriUYyZqD_Nk6Foob8jgEoF__K0KJcW1O0AqGzJTKLG3n2OFADY9LIsLvDhGqb8--2I5',
  },
  {
    id: '2',
    type: 'follow',
    username: 'VibeCheck',
    userAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCATrOBE5hW87ZmXdIA2It-xaA_C45NUmlLZ3a32X5v7yhmYFL5GHkP6m8Gy_9SncvZVueX80NSzwCNVPzznpqUSi61hbeBa1zZIwwFo5piMvycP5ssd-BeLiUzDTBy-exp33GE00Oc7_Bkew1YDkb8uUkMCbwoLcNbORw1Jp-8GiJDnIRmeO2UPbkZHabm1kFlOdhdH0skl7_9TttT6jeaNcSXN9TQCL_hxHXolzWjTy5Nz5CBC1-h4ljYMcdPsF6uUeBbnXXkNtAU',
    content: 'started following you',
    timestamp: '5h',
  },
  {
    id: '3',
    type: 'comment',
    username: 'Jax_Arts',
    userAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDV9rBm0P2cQhI52lJr_8Yn2zd0MtMOp9u0GP8dY1ZkTtLhfxfPo6Gdu0RXQSRtBbkC6YkSyu35Cu_9XLjMHn2Styxzwg-3VJY-MNKKp0DyKfvamHF2qBvE2okjoQs1j5GLs5p7ZGsLMdm__59KSbf7FnNl0x3u6UB1p-13pGyief1RRPjJSxSOwdQQMNlEMBWdfCtZqo4SCy940-g0SlJmnySDtYhdJ7mS6B06jU51UzlIBJQkdzu15pcX0wcAqdQK_barIMbB3Ff8',
    content: 'commented: This is fire!',
    timestamp: '8h',
    thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBYCbBcxKLbHZgAqb13v6v4CfEXSPztD2CkLova2flxxNUqZvm-zc6jF7fEQTlJ6St0JCOiSIOPNxLthdRBBjJAvrfzOl1gnNnZ-wcXiYouXgPqlpDbagMtDvJkLvdJyegyjzn0GwTB_qWvRhSmO5AXjtEr7S6fT75NQTNiQvt0bhX7ND9Rb0y5GG3s8NyvkX7Sir7gElswEhAw7_9UluqS7bSrktccLNP5DRrqMxfMM0nmtjOAa8rycp6qlTW-szQb_195XDSDBsEM',
  },
  {
    id: '4',
    type: 'mention',
    username: 'DigitalPulse',
    content: 'mentioned you in a comment',
    timestamp: '2d',
    thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAOots6VE5MKI7LV1V01kcFG4m4qLBmPt7WD0ghfSzwPnPj748PoMBQ4v-xVu32-2zp_THNkI3hgz8kLuZ8ptcsd68SuujyOtMBNDgyi4Di0OKwawLWh9jWFOSgHd20FKPqz4hk59D1YPqry-oFHMGVVGxLbY7bzQlBXkis1k8w-ldZ7axRZhT5mmKvOdl6IzJEcRKxx-TM6fPQUyJM5YGAzVzw5yIeUVCB3xAg8ZL1jKDEJ4RHuMlQyN_JVpJbdjH-fniqmJNltT6k',
  },
  {
    id: '5',
    type: 'like',
    username: 'Sarah_K',
    userAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAo6OA-AFcSmVrh47fV1_QJ3xfQwRsJQjaMIeJLO7zWafldThLvY3EEvMFGEIzd9vNVxKRX-B1Q_HNgm78w2rSd1mPUccwV1WWzvabx9MDqjUZ71DbgHFZo9uVfqW1DRMzWL2b0S1XlqP4W0dSXnfpQkIswvZweRNnDhfxOKiY6hekWhsn8Pg_AXW2K-e8YQSuE43yvLq-m6anhYwya_9Sn9eNa7WEuFOro43qNYr4gWeCt3WmaP8yPii8HMEJMUqD0UIDonkT75GxN',
    userCount: 12,
    content: 'liked your video',
    timestamp: '4d',
    thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCByvg30eXn0YKmDWV3LNw3DbcE81pVphauwz6hOByxERHKzoNUS30GYNzG3WnqUbw_2ps2LRQ9qsVVImPCVEdo0kRYT0yCjicUddiAxJico1Eb2HVhn32jWtA_zoY3-cD25vW0hGQpE0QTwKqdzJltir1FOl2KD-uD0T01ChoZwg7I2xWK10XKJFt4BygwDblyAwTC7Lk7awl6gaZGwmAmw3VC-KxbsSgWKLcPMyl5XZd-fyPFWVnQ0a_8JO96eOfQChAJydKlO1i6',
  },
  {
    id: '6',
    type: 'system',
    content: 'Your video is trending in #DigitalPulse! Check out the stats.',
    timestamp: '6d',
  },
];
