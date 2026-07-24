import {
  Dialog,
  DialogCloseButton,
  DialogContent,
  DialogHeader,
} from '@repo/ui/components/dialog';
import { Spinner } from '@repo/ui/components/spinner';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

type ModalYoutubeLatLongProps = {
  openModalYoutube?: boolean;
  setOpenModalYoutube?: Dispatch<SetStateAction<boolean>>;
};

export function ModalYoutubeLatLong({
  openModalYoutube,
  setOpenModalYoutube,
}: Readonly<ModalYoutubeLatLongProps>) {
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);
  const { t } = useTranslation('common');

  const youtubeVideoId = process.env.YOUTUBE_LATLONG_VIDEO_ID || 'ZJH4niXM88s';

  const handleOpenChange = (open: boolean) => {
    if (open) {
      setIsIframeLoaded(false);
    }
    setOpenModalYoutube?.(open);
  };

  useEffect(() => {
    if (!openModalYoutube) {
      setIsIframeLoaded(false);
    }
  }, [openModalYoutube]);

  return (
    <Dialog open={openModalYoutube} onOpenChange={handleOpenChange} size="2xl">
      <DialogCloseButton />
      <DialogHeader> {t('setting_latlong.title')}</DialogHeader>
      <DialogContent className="px-4 overflow-hidden space-y-4 h-full">
        <div className="w-full aspect-video mb-3 relative">
          {!isIframeLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded">
              <Spinner className="ui-w-full ui-h-10" />
            </div>
          )}
          <iframe
            key={openModalYoutube ? 'youtube-open' : 'youtube-closed'}
            className={`w-full h-full ${isIframeLoaded ? '' : 'invisible'}`}
            src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=${
              openModalYoutube ? 1 : 0
            }`}
            title={t('setting_latlong.title')}
            allow="autoplay; fullscreen"
            allowFullScreen
            onLoad={() => setIsIframeLoaded(true)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
