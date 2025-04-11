document.addEventListener('DOMContentLoaded', function() {
    const mapContainer = document.getElementById('map-container');
    const worldMap = document.getElementById('world-map');
    
    let mapSvg = null;
    let viewBox = { x: 0, y: 0, width: 1000, height: 500 };
    let originalViewBox = { x: 0, y: 0, width: 1000, height: 500 };
    let isDragging = false;
    let startPoint = { x: 0, y: 0 };
    let currentZoom = 100; // 100% is the default zoom level
    
    // Renamed and adjusted zoom limits for clarity
    const MAX_ZOOM_IN = 1000;  // 1000% of original size (10x magnification)
    const MAX_ZOOM_OUT = 50;   // 50% of original size (2x reduction)

    // Initialize map after it loads
    worldMap.addEventListener('load', function() {
        mapSvg = worldMap.contentDocument.querySelector('svg');
        if (mapSvg) {
            // Save original viewBox if it exists
            const vb = mapSvg.getAttribute('viewBox');
            if (vb) {
                const [x, y, width, height] = vb.split(' ').map(Number);
                viewBox = { x, y, width, height };
                originalViewBox = { ...viewBox };
            } else {
                // Set a default viewBox if not present
                mapSvg.setAttribute('viewBox', `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`);
            }
            
            setupMapInteractions();
            setupRegionClickHandlers();
        }
    });

    // Set up map panning
    function setupMapInteractions() {
        mapSvg.addEventListener('mousedown', startDrag);
        mapSvg.addEventListener('mousemove', drag);
        mapSvg.addEventListener('mouseup', endDrag);
        mapSvg.addEventListener('mouseleave', endDrag);
        mapSvg.addEventListener('wheel', handleWheel);
    }

    function startDrag(e) {
        isDragging = true;
        startPoint = {
            x: e.clientX,
            y: e.clientY
        };
        mapSvg.style.cursor = 'grabbing';
    }

    function drag(e) {
        if (!isDragging) return;
        
        e.preventDefault();
        
        // Calculate how much the mouse has moved
        const dx = (e.clientX - startPoint.x) * (viewBox.width / mapSvg.clientWidth);
        const dy = (e.clientY - startPoint.y) * (viewBox.height / mapSvg.clientHeight);
        
        // Update the start point for the next drag event
        startPoint.x = e.clientX;
        startPoint.y = e.clientY;
        
        // Update the viewBox
        viewBox.x -= dx;
        viewBox.y -= dy;
        
        // Apply boundaries to prevent excessive panning
        applyPanBoundaries();
        
        // Apply the new viewBox
        updateViewBox();
    }

    function endDrag() {
        isDragging = false;
        mapSvg.style.cursor = 'grab';
    }

    function handleWheel(e) {
        e.preventDefault();
        
        // Negative deltaY (scroll up) increases zoom value (more magnification)
        // Positive deltaY (scroll down) decreases zoom value (less magnification)
        const delta = e.deltaY > 0 ? -10 : 10;
        
        // Update zoom level
        let newZoom = currentZoom + delta;
        
        // Apply zoom limits
        newZoom = Math.min(MAX_ZOOM_IN, Math.max(MAX_ZOOM_OUT, newZoom));
        
        // Apply zoom
        applyZoom(newZoom, e.clientX, e.clientY);
    }

    function applyZoom(zoomLevel, centerX = null, centerY = null) {
        // Store the previous zoom level
        const prevZoom = currentZoom;
        currentZoom = zoomLevel;
        
        // Calculate zoom factor
        const zoomFactor = prevZoom / currentZoom;
        
        if (centerX !== null && centerY !== null) {
            // Get mouse position relative to the SVG
            const boundingRect = mapSvg.getBoundingClientRect();
            const mouseX = centerX - boundingRect.left;
            const mouseY = centerY - boundingRect.top;
            
            // Convert mouse position to SVG coordinates
            const svgX = viewBox.x + (mouseX / boundingRect.width) * viewBox.width;
            const svgY = viewBox.y + (mouseY / boundingRect.height) * viewBox.height;
            
            // Scale the viewBox around the mouse position
            viewBox.width *= zoomFactor;
            viewBox.height *= zoomFactor;
            viewBox.x = svgX - (mouseX / boundingRect.width) * viewBox.width;
            viewBox.y = svgY - (mouseY / boundingRect.height) * viewBox.height;
        } else {
            // If no center point specified, zoom from the center of the current view
            const centerX = viewBox.x + viewBox.width / 2;
            const centerY = viewBox.y + viewBox.height / 2;
            
            viewBox.width *= zoomFactor;
            viewBox.height *= zoomFactor;
            viewBox.x = centerX - viewBox.width / 2;
            viewBox.y = centerY - viewBox.height / 2;
        }
        
        // Apply boundaries after zooming
        applyPanBoundaries();
        
        // Apply the new viewBox
        updateViewBox();
    }

    function applyPanBoundaries() {
        // Calculate the center point of the original viewBox
        const centerX = originalViewBox.x + originalViewBox.width / 2;
        const centerY = originalViewBox.y + originalViewBox.height / 2;
        
        // IMPORTANT: Only restrict panning when at maximum zoom-out
        if (currentZoom <= MAX_ZOOM_OUT * 1.05) {
            // When fully zoomed out (or very close), center the map and prevent panning
            viewBox.x = centerX - viewBox.width / 2;
            viewBox.y = centerY - viewBox.height / 2;
            return; // Exit early, no other boundaries needed when fully zoomed out
        }
        
        // For all other zoom levels, apply dynamic boundaries
        
        // Calculate the allowed pan ratio based on zoom level
        // Higher zoom values mean MORE magnification, allow more freedom to pan
        // Normalize the zoom level to a 0-1 scale for calculation
        const zoomRange = MAX_ZOOM_IN - MAX_ZOOM_OUT;
        const normalizedZoom = (currentZoom - MAX_ZOOM_OUT) / zoomRange;
        
        // Calculate the allowed pan ratio - more freedom when zoomed in
        // This formula gives more panning freedom as you zoom in
        const allowedPanRatio = 0.5 + (normalizedZoom * 3.5);
        
        // Calculate max pan distance based on original dimensions
        const maxPanX = originalViewBox.width * allowedPanRatio;
        const maxPanY = originalViewBox.height * allowedPanRatio;
        
        // Calculate the current view center
        const currentCenterX = viewBox.x + viewBox.width / 2;
        const currentCenterY = viewBox.y + viewBox.height / 2;
        
        // Calculate distance from original center
        const panDistanceX = currentCenterX - centerX;
        const panDistanceY = currentCenterY - centerY;
        
        // Apply the boundaries - only if we exceed the maximum pan distance
        if (Math.abs(panDistanceX) > maxPanX) {
            const adjustment = (Math.abs(panDistanceX) - maxPanX) * Math.sign(panDistanceX);
            viewBox.x -= adjustment;
        }
        
        if (Math.abs(panDistanceY) > maxPanY) {
            const adjustment = (Math.abs(panDistanceY) - maxPanY) * Math.sign(panDistanceY);
            viewBox.y -= adjustment;
        }
    }

    function updateViewBox() {
        mapSvg.setAttribute('viewBox', `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`);
    }

    function setupRegionClickHandlers() {
        // Get all regions/countries in the SVG
        const regions = mapSvg.querySelectorAll('path');
        
        regions.forEach(region => {
            // Add class for styling
            region.classList.add('clickable-area');
            
            // Add click handler
            region.addEventListener('click', function(e) {
                const regionId = this.id || 'unknown';
                console.log(`Clicked on region: ${regionId}`);
                
                // Show tooltip or info about the region
                showRegionInfo(regionId, e.clientX, e.clientY);
            });
        });
    }

    function showRegionInfo(regionId, x, y) {
        // Remove any existing tooltip
        const existingTooltip = document.querySelector('.map-tooltip');
        if (existingTooltip) {
            existingTooltip.remove();
        }
        
        // Create tooltip element
        const tooltip = document.createElement('div');
        tooltip.className = 'map-tooltip';
        tooltip.innerHTML = `<h4>${regionId}</h4>`;
        
        // Position the tooltip
        tooltip.style.left = `${x + 10}px`;
        tooltip.style.top = `${y + 10}px`;
        
        // Add to document
        document.body.appendChild(tooltip);
        
        // Show the tooltip
        tooltip.style.display = 'block';
        
        // Hide after delay
        setTimeout(() => {
            tooltip.remove();
        }, 3000);
    }
});