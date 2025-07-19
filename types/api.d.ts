export interface ApiResponse {}

export interface AuthResponse extends ApiResponse {
  token: string,
  user: User
}

export interface User {
  id: string,
  username: string,
  nickname: string | null,
  avatarUrl: string | null,
  emote: string | null,
  active: boolean,
  administrator: boolean,
  guest: boolean
}

export interface Anime extends ApiResponse {
  id: number,
  group: string,
  order: number,
  title: string,
  url: string,
  imageUrl: string,
  episodes: Episode[]
}

export interface Episode {
  id: number,
  number: number
}

export interface EpisodeDescriptor extends ApiResponse {
  mpd: string,
  download: string | null,
  anime: string,
  number: int
  tracks: AnisekaiTrack[]
}

export interface AnisekaiTrack {
  id: number,
  name: string,
  codec: string,
  type: string,
  language: string | null,
  dispositions: string[]
}

export interface SpringError {
  timestamp: string,
  status: number,
  error: string,
  path: string
}
