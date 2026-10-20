import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { startPhotoApp } from "./photo-app.js";

export default function App() {
  useEffect(() => {
    startPhotoApp();
  }, []);

  return (
    <>
      <header>
        <h1>Photo Date Albums</h1>
        <div className="header-actions">
          <Button id="appearance-switch" type="button" variant="secondary">
            light
          </Button>
          <Button id="sign-out" type="button" variant="secondary" hidden>
            Sign out
          </Button>
          <Button id="add-photos" type="button" hidden>
            Add photos
          </Button>
          <input id="file-input" type="file" multiple hidden />
        </div>
      </header>
      <Card className="shell">
        <CardContent>
          <main id="app" />
        </CardContent>
      </Card>
    </>
  );
}
