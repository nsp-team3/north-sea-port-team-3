<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>ONS</title>
    <link rel="stylesheet" href="/css/app.css" />
    <!-- https://favicon.io/favicon-converter/ -->
    <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16x16.png">
    <link rel="manifest" href="/favicon/site.webmanifest">
    <script src="/js/app.js"></script>
</head>

<body>
    <!-- optionally define the sidebar content via HTML markup -->
    <div id="sidebar" class="leaflet-sidebar collapsed">

        <!-- Navigatie tabblad iconen -->
        <div class="leaflet-sidebar-tabs">
            <!-- vanboven gepinde items -->
            <ul role="tablist">
                <li><a href="#searchTab" role="tab"><i class="fa fa-ship active"></i></a></li>
                <li><a href="#detailsTab" role="tab"><i class="fa fa-info-circle"></i></a></li>
            </ul>
        </div>

        <!-- inhoud zijbalk -->
        <div class="leaflet-sidebar-content">
            <!-- inhoud zoekopdrachten -->
            <div class="leaflet-sidebar-pane" id="searchTab">

                <h1 class="leaflet-sidebar-header">
                    <span id="search-title">Zoeken</span>
                    <span class="leaflet-sidebar-close">
                        <i class="fa fa-caret-right"></i>
                    </span>
                </h1>

                <div class="input-group mt-3">
                    <input type="search" id="searchbar" class="form-control rounded" placeholder="Zoeken" aria-label="Zoeken" aria-describedby="search-addon" />
                </div>

                <div class="mt-1">
                    <button type="button" id="vessels-button" class="btn btn-primary">Schepen</button>
                    <button type="button" id="ports-button" class="btn btn-primary">Havens</button>
                    <button type="button" id="berths-button" class="btn btn-primary">Ligplaatsen</button>
                </div>

                <div class="mt-3">
                    <table id="search-results" class="table"></table>
                </div>
            </div>

            <!-- inhoud details zijbalk -->
            <div class="leaflet-sidebar-pane" id="detailsTab">

                <h1 class="leaflet-sidebar-header">
                    <span id="details-title">Details</span>
                    <span class="leaflet-sidebar-close">
                        <i class="fa fa-caret-right"></i>
                    </span>
                </h1>

                <div class="title mt-3">
                    <i id="back-button" class="fa fa-arrow-circle-left back-button"></i>
                </div>

                <table id="details-content" class="table mt-3"></table>
            </div>
        </div>
    </div>

    <div id="map"></div>
</body>

</html>
