export interface MusicTrack {
  id: "vet-muc-tren-giay" | "duoi-anh-den-dau";
  title: string;
  mood: string;
  src: string;
}

export const MUSIC_TRACKS: MusicTrack[] = [
  {
    id: "duoi-anh-den-dau",
    title: "Dưới ánh đèn dầu",
    mood: "Ấm áp, hoài niệm — gõ mõ nhẹ giữa nhịp",
    src: "/audio/duoi-anh-den-dau.mp3",
  },
  {
    id: "vet-muc-tren-giay",
    title: "Vệt mực trên giấy",
    mood: "Trầm tĩnh, thiền định — đàn tranh dẫn dắt",
    src: "/audio/vet-muc-tren-giay.mp3",
  },
];

export const DEFAULT_TRACK_ID: MusicTrack["id"] = "duoi-anh-den-dau";
