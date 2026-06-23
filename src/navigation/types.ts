export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
  LiveList: undefined;
  LiveHost: { title: string; channelId?: string; liveId?: string };
  LiveViewer: { liveId: string; channelId: string; hostUsername: string; title: string };
  LiveStart: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type BottomTabParamList = {
  HomeTab: undefined;
  ForYouTab: undefined;
  UploadTab: undefined;
  InboxTab: undefined;
  ProfileTab: undefined;
  LiveTab: undefined;
};

export type HomeStackParamList = {
  Feed: undefined;
  VideoDetail: { videoId: string };
  UserProfile: { uid: string };
};

export type ProfileStackParamList = {
  Profile: { uid?: string };
  Live: undefined;
  Followers: { uid: string };
  Following: { uid: string };
};
export type ForYouStackParamList = {
  Discover: undefined;
  VideoPlayer: { videoId: string; videos: any[] };
};