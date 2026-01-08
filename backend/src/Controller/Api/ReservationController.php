<?php

namespace App\Controller\Api;

use App\Entity\Reservation;
use App\Entity\Car;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

class ReservationController extends AbstractController
{
    #[Route('/api/reservations', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'Musisz być zalogowany'], 401);
        }

        $data = json_decode($request->getContent(), true);

        if (
            empty($data['carId']) ||
            empty($data['startDate']) ||
            empty($data['endDate']) ||
            empty($data['pickUpLocation']) ||
            empty($data['dropOffLocation']) ||
            empty($data['firstName']) ||
            empty($data['lastName']) ||
            empty($data['phoneNumber'])
        ) {
            return $this->json(['error' => 'Brak wymaganych danych'], 400);
        }

        $car = $em->getRepository(Car::class)->find($data['carId']);

        if (!$car) {
            return $this->json(['error' => 'Samochód nie istnieje'], 404);
        }

        $startDate = new \DateTimeImmutable($data['startDate']);
        $endDate   = new \DateTimeImmutable($data['endDate']);

        if ($endDate <= $startDate) {
            return $this->json(['error' => 'Data zakończenia musi być po dacie rozpoczęcia'], 400);
        }

        $conflict = $em->createQueryBuilder()
            ->select('r.id')
            ->from(Reservation::class, 'r')
            ->where('r.car = :car')
            ->andWhere('r.startDate < :end')
            ->andWhere('r.endDate > :start')
            ->setParameter('car', $car)
            ->setParameter('start', $startDate)
            ->setParameter('end', $endDate)
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult();

        if ($conflict) {
            return $this->json([
                'error' => 'Samochód jest już zarezerwowany w tym terminie'
            ], 409);
        }

        $days = $startDate->diff($endDate)->days;
        $totalPrice = $days * $car->getPricePerDay();

        $reservation = new Reservation();
        $reservation->setUser($user);
        $reservation->setCar($car);
        $reservation->setStartDate($startDate);
        $reservation->setEndDate($endDate);
        $reservation->setPickUpLocation($data['pickUpLocation']);
        $reservation->setDropOffLocation($data['dropOffLocation']);
        $reservation->setFirstName($data['firstName']);
        $reservation->setLastName($data['lastName']);
        $reservation->setPhoneNumber($data['phoneNumber']);
        $reservation->setTotalPrice($totalPrice);
        $reservation->setStatus('pending');
        $reservation->setCreatedAt(new \DateTimeImmutable());

        $em->persist($reservation);
        $em->flush();

        return $this->json([
            'message' => 'Rezerwacja utworzona',
            'reservationId' => $reservation->getId(),
            'totalPrice' => $totalPrice
        ], 201);
    }

    #[Route('/api/reservations/me', methods: ['GET'])]
    public function myReservations(EntityManagerInterface $em): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'Musisz być zalogowany'], 401);
        }

        $rows = $em->createQueryBuilder()
            ->select('r.id, r.startDate, r.endDate, r.pickUpLocation, r.dropOffLocation, r.totalPrice, r.status, r.createdAt')
            ->addSelect('c.id AS carId, c.brand, c.model, c.registrationNumber')
            ->from(Reservation::class, 'r')
            ->join('r.car', 'c')
            ->where('r.user = :user')
            ->setParameter('user', $user)
            ->orderBy('r.id', 'DESC')
            ->getQuery()
            ->getArrayResult();

        $rows = array_map(function ($r) {
            $r['startDate'] = $r['startDate']?->format('Y-m-d');
            $r['endDate']   = $r['endDate']?->format('Y-m-d');
            $r['createdAt'] = $r['createdAt']?->format('Y-m-d H:i:s');
            return $r;
        }, $rows);

        return $this->json($rows);
    }
    
    #[Route('/api/cars/{id}/availability', methods: ['GET'])]
    public function availability(int $id, Request $request, EntityManagerInterface $em): JsonResponse
    {
        $car = $em->getRepository(Car::class)->find($id);
        if (!$car) {
            return $this->json(['error' => 'Nie ma takiego auta'], 404);
        }

        $from = new \DateTimeImmutable($request->query->get('from'));
        $to   = new \DateTimeImmutable($request->query->get('to'));

        $rows = $em->createQueryBuilder()
            ->select('r.startDate, r.endDate')
            ->from(Reservation::class, 'r')
            ->where('r.car = :car')
            ->andWhere('r.endDate > :from')
            ->andWhere('r.startDate < :to')
            ->setParameter('car', $car)
            ->setParameter('from', $from)
            ->setParameter('to', $to)
            ->getQuery()
            ->getArrayResult();

        return $this->json(array_map(fn($r) => [
            'start' => $r['startDate']->format('Y-m-d'),
            'end'   => $r['endDate']->format('Y-m-d'),
        ], $rows));
    }
    
}
