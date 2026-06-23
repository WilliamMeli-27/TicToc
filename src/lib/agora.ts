export const AGORA_CONFIG = {
  appId: '6dec570dd3cf416c857b924ae2ae23bd',
};

// Génère un channel ID unique pour chaque live
export const generateChannelId = (uid: string): string => {
  return `live_${uid}_${Date.now()}`;
};