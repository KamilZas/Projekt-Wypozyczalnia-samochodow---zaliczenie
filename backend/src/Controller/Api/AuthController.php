<?php

namespace App\Controller\Api;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use App\Repository\UserRepository;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class AuthController extends AbstractController
{
#[Route('/api/register', methods: ['POST'])]
public function register(
    Request $request,
    EntityManagerInterface $em,
    UserPasswordHasherInterface $hasher,
    UserRepository $userRepository,
    ValidatorInterface $validator
): JsonResponse {
    $data = json_decode($request->getContent(), true);

    if (empty($data['email']) || empty($data['password'])) {
        return $this->json(['error' => 'Brak danych'], 400);
    }

    // ✅ SPRAWDZENIE CZY EMAIL JUŻ ISTNIEJE
    if ($userRepository->findOneBy(['email' => $data['email']])) {
        return $this->json([
            'error' => 'Ten email już istnieje'
        ], 400);
    }

    $user = new User();
    $user->setEmail($data['email']);
    $user->setRoles(['ROLE_USER']);
    $user->setPassword(
        $hasher->hashPassword($user, $data['password'])
    );

    // ✅ WALIDACJA (email z @ itd.)
    $errors = $validator->validate($user);
    if (count($errors) > 0) {
        return $this->json(['error' => $errors[0]->getMessage()], 400);
    }

    $em->persist($user);
    $em->flush();

    return $this->json([
        'message' => 'Użytkownik utworzony'
    ], 201);
}



    // Kotwica dla Security json_login (żeby nie było 404).
    // Security przejmie request zanim tu wejdzie, a jeśli nie przejmie,
    // to przynajmniej nie będzie 404.
    #[Route('/api/login', name: 'api_login', methods: ['POST'])]
    public function login(): Response
    {
        return new Response('', 204);
    }

    #[Route('/api/logout', name: 'api_logout', methods: ['POST'])]
    public function logout(): Response
    {
        return new Response('', 204);
    }

    #[Route('/api/me', methods: ['GET'])]
    public function me(): JsonResponse
    {
        $user = $this->getUser();

        if (!$user) {
            return $this->json(null, 200);
        }

        return $this->json([
            'id' => $user->getId(),
            'email' => $user->getUserIdentifier(),
            'roles' => $user->getRoles(),
        ]);
    }
}
