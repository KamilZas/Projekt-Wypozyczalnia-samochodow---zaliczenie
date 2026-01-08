<?php

namespace App\Controller\Api;

use App\Entity\Reservation;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

class AdminReservationController extends AbstractController
{
    #[Route('/api/admin/reservations', methods: ['GET'])]
    public function activeReservations(EntityManagerInterface $em): JsonResponse
    {
        $now = new \DateTimeImmutable();

        $rows = $em->createQueryBuilder()
            ->select('r.id, r.startDate, r.endDate, r.pickUpLocation, r.dropOffLocation, r.totalPrice, r.status, r.createdAt')
            ->addSelect('c.id AS carId, c.brand, c.model, c.registrationNumber')
            ->addSelect('u.email AS userEmail')
            ->from(Reservation::class, 'r')
            ->join('r.car', 'c')
            ->join('r.user', 'u')
            ->where('r.startDate <= :now')
            ->andWhere('r.endDate >= :now')
            ->setParameter('now', $now)
            ->orderBy('r.startDate', 'ASC')
            ->getQuery()
            ->getArrayResult();

        $rows = array_map(function ($r) {
            $r['startDate'] = $r['startDate']?->format('Y-m-d');
            $r['endDate'] = $r['endDate']?->format('Y-m-d');
            $r['createdAt'] = $r['createdAt']?->format('Y-m-d H:i:s');
            return $r;
        }, $rows);

        return $this->json($rows);
    }

    #[Route('/api/admin/reservations/{id}', methods: ['DELETE'])]
    public function deleteReservation(int $id, EntityManagerInterface $em): JsonResponse
    {
        $reservation = $em->getRepository(Reservation::class)->find($id);
        if (!$reservation) {
            return $this->json(['error' => 'Nie znaleziono rezerwacji'], 404);
        }

        $em->remove($reservation);
        $em->flush();

        return $this->json(['message' => 'Rezerwacja usunięta']);
    }
}
