<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20250920143000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add customer details to reservation';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE reservation ADD first_name VARCHAR(100) NOT NULL, ADD last_name VARCHAR(120) NOT NULL, ADD phone_number VARCHAR(40) NOT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE reservation DROP first_name, DROP last_name, DROP phone_number');
    }
}
