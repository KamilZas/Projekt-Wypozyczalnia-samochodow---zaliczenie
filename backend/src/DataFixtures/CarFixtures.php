<?php

namespace App\DataFixtures;

use App\Entity\Car;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class CarFixtures extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        $carsData = [
            [
                'brand' => 'Toyota',
                'model' => 'Corolla',
                'registrationNumber' => 'PZ12345',
                'year' => 2020,
                'transmission' => 'manual',
                'fuelType' => 'benzyna',
                'seats' => 5,
                'class' => 'economy',
                'pricePerDay' => 120,
                'status' => 'available',
            ],
            [
                'brand' => 'BMW',
                'model' => 'X5',
                'registrationNumber' => 'PO98765',
                'year' => 2022,
                'transmission' => 'automatic',
                'fuelType' => 'diesel',
                'seats' => 5,
                'class' => 'suv',
                'pricePerDay' => 350,
                'status' => 'available',
            ],
            [
                'brand' => 'Audi',
                'model' => 'A4',
                'registrationNumber' => 'GD45678',
                'year' => 2021,
                'transmission' => 'automatic',
                'fuelType' => 'benzyna',
                'seats' => 5,
                'class' => 'standard',
                'pricePerDay' => 220,
                'status' => 'available',
            ],
            [
                'brand' => 'Skoda',
                'model' => 'Fabia',
                'registrationNumber' => 'KR33445',
                'year' => 2019,
                'transmission' => 'manual',
                'fuelType' => 'benzyna',
                'seats' => 5,
                'class' => 'economy',
                'pricePerDay' => 95,
                'status' => 'available',
            ],
        ];

        foreach ($carsData as $item) {
            $car = new Car();
            $car->setBrand($item['brand']);
            $car->setModel($item['model']);
            $car->setRegistrationNumber($item['registrationNumber']);
            $car->setYear($item['year']);
            $car->setTransmission($item['transmission']);
            $car->setFuelType($item['fuelType']);
            $car->setSeats($item['seats']);
            $car->setClass($item['class']);
            $car->setPricePerDay($item['pricePerDay']);
            $car->setStatus($item['status']);

            $manager->persist($car);
        }

        $manager->flush();
    }
}
