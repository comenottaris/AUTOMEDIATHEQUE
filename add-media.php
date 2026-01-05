<?php
// add-media.php
header('Content-Type: application/json; charset=utf-8');

// Fichier où on enregistre les contributions
// Idée : utiliser un fichier à part, ex. "propositions.json"
$jsonFile = __DIR__ . '/propositions.json';

// Lecture champs POST
$name        = trim($_POST['name']        ?? '');
$url         = trim($_POST['url']         ?? '');
$type        = trim($_POST['type']        ?? '');
$country     = trim($_POST['country']     ?? '');
$languages   = trim($_POST['languages']   ?? '');
$description = trim($_POST['description'] ?? '');

// Vérif minimale
if ($name === '' || $url === '' || $type === '' || $country === '') {
    echo json_encode(['ok' => false, 'error' => 'Champs obligatoires manquants']);
    exit;
}

// Transforme "fr, en" -> ["fr","en"]
$langArray = [];
if ($languages !== '') {
    $parts = explode(',', $languages);
    foreach ($parts as $p) {
        $p = trim($p);
        if ($p !== '') {
            $langArray[] = $p;
        }
    }
}

// Nouvelle entrée
$newItem = [
    'name'        => $name,
    'url'         => $url,
    'type'        => $type,
    'country'     => $country,
    'languages'   => $langArray,
    'status'      => 'pending', // ou 'online' si tu veux direct
    'description' => $description,
];

// Charge l'ancien JSON (ou tableau vide si fichier absent / vide)
$data = [];
if (file_exists($jsonFile)) {
    $content = file_get_contents($jsonFile);
    if ($content !== '') {
        $decoded = json_decode($content, true);
        if (is_array($decoded)) {
            $data = $decoded;
        }
    }
}

// Ajoute l’entrée
$data[] = $newItem;

// Écrit dans le fichier (avec lock pour éviter les collisions)
$tmp = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
if (file_put_contents($jsonFile, $tmp, LOCK_EX) === false) {
    echo json_encode(['ok' => false, 'error' => 'Impossible d’écrire le fichier JSON']);
    exit;
}

echo json_encode(['ok' => true]);
