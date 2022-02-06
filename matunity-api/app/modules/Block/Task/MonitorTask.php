<?php
declare(strict_types=1);

namespace App\Block\Task;

use Phalcon\CLI\Task;
use Imagick,
    ImagickDraw,
    ImagickPixel;

use App\Block\Model\BlockEvent;

class MonitorTask extends Task
{

    public function scanAction()
    {
        $lastBlock = $this->blockSettingsRepository->getByParam('lastBlock', false);
        $currentBlock =  $this->blockAnkrManager->getCurrentBlock();
        if ((int) $lastBlock->value + 1500 < $currentBlock) {
            $currentBlock = (int) $lastBlock->value + 1500;
        }
        $logs = $this->blockAnkrManager->getLogs((int) $lastBlock->value, $currentBlock);

        foreach ($logs as $log) {
            $event = new BlockEvent();
            if ($log['topics']['0'] == '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef') {
                $event->transaction = $log['transactionHash'];
                $event->owner = $this->blockAnkrManager->getAddressFromResponse($log['topics']['2']);
                $event->block_id = $this->blockAnkrManager->getIntFromResponse($log['topics']['3']);
                if ($log['topics']['1'] == '0x0000000000000000000000000000000000000000000000000000000000000000') {
                    $event->event = 'mint';
                } else {
                    $event->event = 'transfer';
                }
                $this->blockEventsRepository->save($event);
            } elseif ($log['topics']['0'] == '0xd847a390757ba4d634dc7b79c0b0ae0f3b19305c663d9e7156e95c3353cc5a28') {
                $event->transaction = $log['transactionHash'];
                $event->owner = $this->blockAnkrManager->getAddressFromResponse($log['topics']['1']);
                $event->block_id = $this->blockAnkrManager->getIntFromResponse($log['topics']['2']);
                $event->event = 'data';
                $this->blockEventsRepository->save($event);
            } elseif ($log['topics']['0'] == '0xa331394e065c18c8bfc9725eca8e9563172227caa75f4ec820bae35670f2b7e2') {
                $event->transaction = $log['transactionHash'];
                $event->owner = '0x0000000000000000000000000000000000000000';
                $event->block_id = $this->blockAnkrManager->getIntFromResponse($log['topics']['1']);
                $event->event = 'earnings';
                $this->blockEventsRepository->save($event);
            }
        }

        $lastBlock->value = $currentBlock;
        $this->blockSettingsRepository->save($lastBlock);

        return count($logs);
    }

    public function processAction()
    {
        $event = $this->blockEventsRepository->getUnprocessedEvent();
        if (!$event) {
            return 0;
        }
        if ($event->event == 'mint') {
            $block = $this->blocksRepository->getById($event->block_id, true);
            $block->owner = $event->owner;
            $block->timestamp_minted = time();
            $block->timestamp_updated = null;
            $this->blocksRepository->save($block);

            $event->timestamp_processed = time();
            $this->blockEventsRepository->save($event);
        } elseif ($event->event == 'transfer') {
            $block = $this->blocksRepository->getById($event->block_id, true);
            $block->owner = $event->owner;
            $block->timestamp_updated = null;
            $this->blocksRepository->save($block);

            $event->timestamp_processed = time();
            $this->blockEventsRepository->save($event);
        } elseif ($event->event == 'data') {
            $block = $this->blocksRepository->getById($event->block_id, true);
            $data = $this->blockAnkrManager->getTokenData((int) $event->block_id);

            $block->name = $data['name'];
            $block->description = $data['description'];

            if ($data['content']) {
                $blockImage = new Imagick();
                $blockImage->readImageBlob(base64_decode(preg_replace('/data:image\/[^;]+;base64,/', '', $data['content'])));
                $blockImage->adaptiveResizeImage($this->config->modules->block->params->size, $this->config->modules->block->params->size);
                $block->content = 'data:image/png;base64,' . base64_encode((string) $blockImage);
            } else {
                $block->content = null;
            }

            $block->earned = $data['earned'];
            $block->claimed = $data['claimed'];

            $block->timestamp_updated = time();
            $this->blocksRepository->save($block);

            $event->timestamp_processed = time();
            $this->blockEventsRepository->save($event);
        } elseif ($event->event == 'earnings') {
            $block = $this->blocksRepository->getById($event->block_id, true);
            $data = $this->blockAnkrManager->getTokenData((int) $event->block_id);

            $block->earned = $data['earned'];
            $block->claimed = $data['claimed'];
            $this->blocksRepository->save($block);

            $event->timestamp_processed = time();
            $this->blockEventsRepository->save($event);
        }

        return $this->blockEventsRepository->getUnprocessedEventCount();
    }

}
