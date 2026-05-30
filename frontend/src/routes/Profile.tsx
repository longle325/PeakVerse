import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/stores/useAppStore";
import MusicSettingsCard from "@/components/MusicSettingsCard";

export default function Profile() {
  const navigate = useNavigate();
  const profile = useAppStore((s) => s.profile);
  const points = useAppStore((s) => s.points);
  const matches = useAppStore((s) => s.matches);
  const completed = useAppStore((s) => s.completed);
  const resetAll = useAppStore((s) => s.resetAll);

  return (
    <section className="page narrow">
      <div className="profile-card card">
        <p className="kicker">Hồ sơ</p>
        <h1 className="headline-lg">{profile?.username}</h1>
        <p className="lead">
          Lớp {profile?.grade}. Dữ liệu thử nghiệm đang được lưu cục bộ trong
          trình duyệt.
        </p>
        <div className="profile-meta">
          <div className="panel stat">
            <strong>{points}</strong>
            <span>Điểm</span>
          </div>
          <div className="panel stat">
            <strong>{matches.length}</strong>
            <span>Nhân vật đã chọn</span>
          </div>
          <div className="panel stat">
            <strong>{Object.keys(completed).length}</strong>
            <span>Thử thách đã làm</span>
          </div>
        </div>
        <div className="actions-row">
          <button
            className="btn ghost"
            onClick={() => {
              resetAll();
              navigate("/onboarding", { replace: true });
            }}
          >
            Đặt lại dữ liệu thử nghiệm
          </button>
        </div>
      </div>
      <MusicSettingsCard />
    </section>
  );
}
