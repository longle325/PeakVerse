import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { CheckCircle, BookOpen } from "lucide-react";
import { useCharacter, useSubmitChallengeMutation } from "@/api/queries";
import { useAppStore } from "@/stores/useAppStore";
import type { Character, ChallengeResult } from "@/types";

function ResultView({
  character,
  result,
  onRetry,
}: {
  character: Character;
  result: ChallengeResult;
  onRetry: () => void;
}) {
  return (
    <section className="page narrow">
      <div className="challenge-card card">
        <p className="kicker">Kết quả thử thách</p>
        <h1 className="headline-lg">
          {character.name}: {result.score}/5 câu đúng
        </h1>
        <p className="lead">
          {result.passed
            ? "Đã mở khóa hoàn toàn. Bạn hiểu được các lớp động cơ và bối cảnh chính của nhân vật."
            : "Chưa đạt mốc 4/5. Hãy đọc giải thích rồi làm lại để củng cố kiến thức."}
        </p>
        <div className="stat-grid" style={{ marginTop: 18 }}>
          <div className="panel stat">
            <strong>+{result.awarded}</strong>
            <span>Điểm nhận được</span>
          </div>
          <div className="panel stat">
            <strong>{result.passed ? "Đạt" : "Chưa đạt"}</strong>
            <span>Trạng thái</span>
          </div>
          <div className="panel stat">
            <strong>{result.perfect ? "5/5" : "4/5"}</strong>
            <span>Mốc mở khóa</span>
          </div>
        </div>
        <div className="result-list">
          {character.challenge.map((question, index) => {
            const picked = result.answers[index];
            // In real mode `question.answer` is a -1 stub (server hides it
            // pre-submission); the authoritative correct index comes back in
            // `result.correctAnswers`. Fall back to the seed value for mock.
            const correctIndex =
              result.correctAnswers?.[index] ?? question.answer;
            const isCorrect = picked === correctIndex;
            return (
              <div key={index} className="info-block">
                <h3>
                  {isCorrect ? "Đúng" : "Cần xem lại"} - Câu {index + 1}
                </h3>
                <p>
                  <strong>{question.text}</strong>
                </p>
                <p>Đáp án đúng: {question.options[correctIndex]}</p>
                <p>{question.explanation}</p>
              </div>
            );
          })}
        </div>
        <div className="actions-row">
          <Link className="btn primary" to="/leaderboard">
            Xem bảng xếp hạng
          </Link>
          <Link
            className="btn secondary"
            to={`/characters/${character.id}/chat`}
          >
            Quay lại trò chuyện
          </Link>
          <button className="btn ghost" onClick={onRetry}>
            Làm lại
          </button>
        </div>
      </div>
    </section>
  );
}

export default function Challenge() {
  const { id } = useParams<{ id: string }>();
  const matches = useAppStore((s) => s.matches);
  const completed = useAppStore((s) => s.completed);
  const retryChallenge = useAppStore((s) => s.retryChallenge);
  const navigate = useNavigate();
  const { data: character, isLoading } = useCharacter(id);
  const submit = useSubmitChallengeMutation();

  const [activeQuestion, setActiveQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);

  useEffect(() => {
    setActiveQuestion(0);
    setAnswers([]);
  }, [id]);

  if (!id) return <Navigate to="/discover" replace />;
  if (isLoading) return null;
  if (!character || !matches.includes(id)) {
    return (
      <section className="page narrow">
        <div className="card empty-state">
          <h1 className="headline-lg">Chưa mở khóa thử thách</h1>
          <p className="lead">
            Bạn cần chọn nhân vật trong màn Khám phá trước khi làm thử thách.
          </p>
          <Link className="btn primary" to="/discover">
            Quay lại Khám phá
          </Link>
        </div>
      </section>
    );
  }

  const existing = completed[id];
  if (existing) {
    return (
      <ResultView
        character={character}
        result={existing}
        onRetry={() => {
          retryChallenge(id);
          setActiveQuestion(0);
          setAnswers([]);
        }}
      />
    );
  }

  const question = character.challenge[activeQuestion];
  const total = character.challenge.length;
  const isLast = activeQuestion === total - 1;
  const selected = answers[activeQuestion];
  const canAdvance = selected !== undefined;

  const pickOption = (index: number) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[activeQuestion] = index;
      return next;
    });
  };

  const handleNext = async () => {
    if (!canAdvance) return;
    if (!isLast) {
      setActiveQuestion((q) => q + 1);
      return;
    }
    await submit.mutateAsync({ id, answers });
    navigate(`/characters/${id}/challenge`, { replace: true });
  };

  return (
    <section className="page narrow reference-challenge">
      <div className="challenge-progress-top">
        <span style={{ width: `${((activeQuestion + 1) / total) * 100}%` }} />
      </div>
      <p className="kicker">
        Câu hỏi {activeQuestion + 1} / {total}
      </p>
      <h1 className="headline-lg">Thử thách nhân vật: {character.name}</h1>
      <div className="challenge-card card">
        <p className="question">{question.text}</p>
        <div className="info-stack">
          {question.options.map((option, index) => {
            const active = selected === index;
            return (
              <button
                key={index}
                className={`option${active ? " active" : ""}`}
                onClick={() => pickOption(index)}
                type="button"
              >
                <strong>{String.fromCharCode(65 + index)}</strong>
                <span>{option}</span>
                {active && <CheckCircle size={18} />}
              </button>
            );
          })}
        </div>
      </div>
      <div className="challenge-actions">
        <button
          className="btn ghost"
          onClick={() => setActiveQuestion((q) => Math.max(0, q - 1))}
          disabled={activeQuestion === 0}
          type="button"
        >
          <BookOpen size={16} />
          Cần gợi ý? Xem lại văn bản
        </button>
        <button
          className="btn primary"
          type="button"
          disabled={!canAdvance || submit.isPending}
          onClick={handleNext}
        >
          {isLast ? "Nộp bài" : "Câu tiếp theo"}
        </button>
      </div>
    </section>
  );
}
