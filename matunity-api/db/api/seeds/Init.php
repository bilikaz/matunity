<?php


use Phinx\Seed\AbstractSeed;

class Init extends AbstractSeed
{
    /**
     * Run Method.
     *
     * Write your database seeder using this method.
     *
     * More information on writing seeders is available here:
     * http://docs.phinx.org/en/latest/seeding.html
     */
    public function run()
    {
        $table = $this->table('blocks');
        for ($i=1; $i <= 500 ; $i++) {
            $table->insert([
                [
                    'block_id' => $i,
                ],
            ]);
        }
        $table->save();

        $table = $this->table('block_settings');
        $data = [
            [
                'param' => 'lastBlock',
                'value' => '22000000'
            ],
        ];
        $table->insert($data)
            ->save();

        $table = $this->table('banners');
        for ($i=1; $i <= 20 ; $i++) {
            $table->insert([
                [
                    'banner_id' => $i,
                ],
            ]);
        }
        $table->save();

        $table = $this->table('banner_settings');
        $data = [
            [
                'param' => 'lastBlock',
                'value' => '22000000'
            ],
        ];
        $table->insert($data)
            ->save();

    }
}
