import { useTranslation } from "react-i18next";
import { SongListScreen } from "../library/song-list-screen.tsx";
import { InstallButton } from "../pwa/install-button.tsx";
import { ReloadNotice } from "../pwa/reload-notice.tsx";
import { UpdatePrompt } from "../pwa/update-prompt.tsx";
import { LanguageSwitch } from "../settings/language-switch.tsx";
import { ViewerScreen } from "../viewer/viewer-screen.tsx";
import { useNavigation } from "./navigation/use-navigation.ts";
import { useServices } from "./services-context.tsx";

export function App() {
  const { t } = useTranslation();
  const { navigation } = useServices();
  const view = useNavigation(navigation);

  return (
    <div className="mx-auto flex min-h-dvh max-w-3xl flex-col gap-6 p-4">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">{t("app.name")}</h1>
        <div className="flex items-center gap-3">
          <InstallButton />
          <LanguageSwitch />
        </div>
      </header>
      <ReloadNotice />
      <UpdatePrompt />
      <main className="flex-1">
        {view.name === "list" ? (
          <SongListScreen />
        ) : (
          <ViewerScreen key={view.songId} songId={view.songId} />
        )}
      </main>
    </div>
  );
}
