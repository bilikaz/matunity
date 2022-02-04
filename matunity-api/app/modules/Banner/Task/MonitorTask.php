<?php
declare(strict_types=1);

namespace App\Banner\Task;

use Phalcon\CLI\Task;
use Imagick,
    ImagickDraw,
    ImagickPixel;

use App\Banner\Model\BannerEvent;

class MonitorTask extends Task
{

    public function scanAction()
    {
        $lastBlock = $this->bannerSettingsRepository->getByParam('lastBlock', false);
        $currentBlock =  $this->bannerAnkrManager->getCurrentBlock();
        if ((int) $lastBlock->value + 1500 < $currentBlock) {
            $currentBlock = (int) $lastBlock->value + 1500;
        }
        $logs = $this->bannerAnkrManager->getLogs((int) $lastBlock->value, $currentBlock);

        foreach ($logs as $log) {
            $event = new BannerEvent();
            if ($log['topics']['0'] == '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef') {
                $event->transaction = $log['transactionHash'];
                $event->owner = $this->bannerAnkrManager->getAddressFromResponse($log['topics']['2']);
                $event->banner_id = $this->bannerAnkrManager->getIntFromResponse($log['topics']['3']);
                if ($log['topics']['1'] == '0x0000000000000000000000000000000000000000000000000000000000000000') {
                    $event->event = 'mint';
                } else {
                    $event->event = 'transfer';
                }
                $this->bannerEventsRepository->save($event);
            } elseif ($log['topics']['0'] == '0xd847a390757ba4d634dc7b79c0b0ae0f3b19305c663d9e7156e95c3353cc5a28') {
                $event->transaction = $log['transactionHash'];
                $event->owner = $this->bannerAnkrManager->getAddressFromResponse($log['topics']['1']);
                $event->banner_id = $this->bannerAnkrManager->getIntFromResponse($log['topics']['2']);
                $event->event = 'data';
                $this->bannerEventsRepository->save($event);
            }
        }

        $lastBlock->value = $currentBlock;
        $this->bannerSettingsRepository->save($lastBlock);

        return count($logs);
    }

    public function processAction()
    {
        $event = $this->bannerEventsRepository->getUnprocessedEvent();
        if (!$event) {
            return 0;
        }
        if ($event->event == 'mint') {
            $banner = $this->bannersRepository->getById($event->banner_id, true);
            $data = $this->bannerAnkrManager->getTokenData((int) $event->banner_id);

            $banner->owner = $event->owner;
            $banner->timestamp_minted = time();
            $banner->timestamp_updated = null;
            $banner->timestamp_lifetime = $data['timestamp_lifetime'];
            $banner->name = $data['name'];
            $banner->description = $data['description'];

            if ($data['content']) {
                $bannerImage = new Imagick();
                $bannerImage->readImageBlob(base64_decode(preg_replace('/data:image\/[^;]+;base64,/', '', $data['content'])));
                $bannerImage->adaptiveResizeImage($this->config->modules->banner->params->size, $this->config->modules->banner->params->size);
                $banner->content = (string) $bannerImage;
            } else {
                $banner->content = null;
            }

            $this->bannersRepository->save($banner);

            $event->timestamp_processed = time();
            $this->bannerEventsRepository->save($event);
        } elseif ($event->event == 'transfer') {
            $banner = $this->bannersRepository->getById($event->banner_id, true);
            $banner->owner = $event->owner;
            $banner->timestamp_updated = null;
            $this->bannersRepository->save($banner);

            $event->timestamp_processed = time();
            $this->bannerEventsRepository->save($event);
        } elseif ($event->event == 'data') {
            $banner = $this->bannersRepository->getById($event->banner_id, true);
            $data = $this->bannerAnkrManager->getTokenData((int) $event->banner_id);

            $banner->name = $data['name'];
            $banner->description = $data['description'];

            if ($data['content']) {
                $bannerImage = new Imagick();
                $bannerImage->readImageBlob(base64_decode(preg_replace('/data:image\/[^;]+;base64,/', '', $data['content'])));
                $bannerImage->adaptiveResizeImage($this->config->modules->banner->params->size, $this->config->modules->banner->params->size);
                $banner->content = (string) $bannerImage;
            } else {
                $banner->content = null;
            }

            $banner->timestamp_updated = time();
            $this->bannersRepository->save($banner);

            $event->timestamp_processed = time();
            $this->bannerEventsRepository->save($event);
        }

        return $this->bannerEventsRepository->getUnprocessedEventCount();
    }

}
