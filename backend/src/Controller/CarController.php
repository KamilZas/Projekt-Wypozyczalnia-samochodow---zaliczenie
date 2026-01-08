<?php

namespace App\Controller;

use App\Entity\Car;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

class CarController extends AbstractController
{
    #[Route('/api/cars', name: 'api_cars_index', methods: ['GET'])]
    public function index(EntityManagerInterface $em): JsonResponse
    {
        $cars = $em->getRepository(Car::class)->findAll();

        $data = [];

        foreach ($cars as $car) {
            $data[] = [
                'id' => $car->getId(),
                'brand' => $car->getBrand(),
                'model' => $car->getModel(),
                'year' => $car->getYear(),
                'class' => $car->getClass(),
                'pricePerDay' => $car->getPricePerDay(),
                'status' => $car->getStatus(),
            ];
        }

        return $this->json($data);
    }
}
