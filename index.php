<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Suki Doces</title>
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="./components/header/header.css">
    <!--Fonts Call-->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap" rel="stylesheet">
</head>
<body>
    <?php
        // HEADER COMPONENT //
        require_once './components/header/header.php';
        // CAROUSEL COMPONENT //
        require_once './components/carousel/carousel.php';
        // PROMOTION STORE //
        require_once './components/promotion-store/promotion-store.php';
        // MARKETING SECTION //
        require_once './components/contoured-section/marketing-section.php';
        // GENERAL SHORT CATALOG //
        require_once './components/short-catalog/short-catalog-general.php';
        // ADS FLAVOURS //
        require_once './components/ads-flavours-section/ads-flavours.php';
        // MARKETING ICE CREAM SECTION //
        require_once './components/contoured-section/marketing-ice-cream-section.php';
        // FOOTER COMPONENT //
        require_once './components/footer/footer.php';
        // HOVER NAV //
        require_once './components/hover-nav/hover-nav.php';
        // V LIBRAS //
        require_once './components/vlibras-comp.php';
    ?>
</body>
</html>