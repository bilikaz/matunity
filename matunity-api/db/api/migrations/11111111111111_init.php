<?php


use Phinx\Migration\AbstractMigration;

class Init extends AbstractMigration
{
    /**
     * Change Method.
     *
     * Write your reversible migrations using this method.
     *
     * More information on writing migrations is available here:
     * http://docs.phinx.org/en/latest/migrations.html#the-abstractmigration-class
     *
     * The following commands can be used in this method and Phinx will
     * automatically reverse them when rolling back:
     *
     *    createTable
     *    renameTable
     *    addColumn
     *    renameColumn
     *    addIndex
     *    addForeignKey
     *
     * Remember to call "create()" or "update()" and NOT "save()" when working
     * with the Table class.
     */
    public function change()
    {

        $table = $this->table('blocks', ['id' => false, 'primary_key' => ['block_id']]);
        $table->addColumn('block_id', 'integer', ['identity' => true])
            ->addColumn('content', 'string', ['limit' => 20000, 'null' => true])
            ->addColumn('description', 'string', ['limit' => 500, 'null' => true])
            ->addColumn('name', 'string', ['limit' => 500, 'null' => true])
            ->addColumn('owner', 'string', ['limit' => 42, 'null' => true])
            ->addColumn('earned', 'decimal', ['precision' => 12, 'scale' => 6, 'null' => true])
            ->addColumn('claimed', 'decimal', ['precision' => 12, 'scale' => 6, 'null' => true])
            ->addColumn('timestamp_updated', 'biginteger', ['null' => true])
            ->addColumn('timestamp_minted', 'biginteger', ['null' => true])
            ->create();

        $table = $this->table('block_settings', ['id' => false, 'primary_key' => ['param']]);
        $table->addColumn('param', 'string', ['limit' => 50])
            ->addColumn('value', 'string', ['limit' => 50])
            ->create();

        $table = $this->table('block_events', ['id' => false, 'primary_key' => ['transaction']]);
        $table->addColumn('transaction', 'string', ['limit' => 80])
            ->addColumn('block_id', 'integer')
            ->addColumn('owner', 'string', ['limit' => 42])
            ->addColumn('event', 'string', ['limit' => 50])
            ->addColumn('timestamp_created', 'biginteger')
            ->addColumn('timestamp_processed', 'biginteger', ['null' => true])
            ->addIndex(['timestamp_processed'])
            ->create();

        $table = $this->table('banners', ['id' => false, 'primary_key' => ['banner_id']]);
        $table->addColumn('banner_id', 'integer', ['identity' => true])
            ->addColumn('content', 'string', ['limit' => 20000, 'null' => true])
            ->addColumn('description', 'string', ['limit' => 500, 'null' => true])
            ->addColumn('name', 'string', ['limit' => 500, 'null' => true])
            ->addColumn('owner', 'string', ['limit' => 42, 'null' => true])
            ->addColumn('timestamp_updated', 'biginteger', ['null' => true])
            ->addColumn('timestamp_minted', 'biginteger', ['null' => true])
            ->addColumn('timestamp_lifetime', 'biginteger', ['null' => true])
            ->create();

        $table = $this->table('banner_settings', ['id' => false, 'primary_key' => ['param']]);
        $table->addColumn('param', 'string', ['limit' => 50])
            ->addColumn('value', 'string', ['limit' => 50])
            ->create();

        $table = $this->table('banner_events', ['id' => false, 'primary_key' => ['transaction']]);
        $table->addColumn('transaction', 'string', ['limit' => 80])
            ->addColumn('banner_id', 'integer')
            ->addColumn('owner', 'string', ['limit' => 42])
            ->addColumn('event', 'string', ['limit' => 50])
            ->addColumn('timestamp_created', 'biginteger')
            ->addColumn('timestamp_processed', 'biginteger', ['null' => true])
            ->addIndex(['timestamp_processed'])
            ->create();

    }
}
