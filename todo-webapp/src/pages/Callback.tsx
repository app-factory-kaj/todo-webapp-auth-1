// The one registered redirect_uri, serving both the redirect and the silent-
// renew legs (thunder-authentication). handleCallback() dispatches on
// request_type; this page renders only while that settles.
import { useEffect, useState, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { handleCallback } from "../authz/session";

export default function CallbackPage(): JSX.Element {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    void (async () => {
      try {
        await handleCallback();
      } catch (e) {
        if (!live) return;
        setError(e instanceof Error ? e.message : "Sign-in failed.");
        return;
      }
      if (!live) return;
      navigate("/", { replace: true });
    })();
    return () => {
      live = false;
    };
  }, [navigate]);

  return (
    <main>
      <h1>Todo</h1>
      <p>{error ?? "Signing you in…"}</p>
    </main>
  );
}
