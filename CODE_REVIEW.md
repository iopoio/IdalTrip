# Code Review: IdalTrip
Date: 2026-04-17

## 1. Project Overview
A monthly/weekly festival and travel itinerary generator leveraging TourAPI 4.0 and Gemini Flash.

## 2. Key Components
- **src/**: React/TS application folder.
- **api/**: Proxy or serverless functions for TourAPI calls.
- **design/**: UI design mockups (Stitch style).

## 3. Review Findings

### 3.1. Design Consistency
- **Strengths**: Strict adherence to the 'Stitch' design system. The map-centric UI feels premium and editorial.
- **Observations**: The project emphasizes UX flow (Phase 4/5), ensuring a seamless "Festival -> Region -> Itinerary" journey.

### 3.2. Data Integration
- **Strengths**: Heavy lifting in fetching from TourAPI 4.0 and Kakao Route APIs.
- **Efficiency**: Uses Gemini Flash for course optimization, which is fast and cost-effective.

### 3.3. Development Status
- **Phase 5**: Major overhaul to a region/date-based Exploration flow is in progress. The logic for multi-day itineraries is complex and well-handled in `ExploreResultPage`.

## 4. Recommendations
- **Deployment Safety**: Ensure `git push` is the only deployment method as per `AGENTS.md`.
- **API Limits**: monitor TourAPI and Kakao API limits closely during peak contest review periods.
- **Performance**: Heavy maps and multiple API calls can slow down the initial exploration—ensure loading states are "high fidelity" (e.g., skeletons).

## 5. Summary
A high-fidelity travel app with strong data backing. The transition to a "Region-First" flow makes the product much more versatile than just a festival lookup tool.
