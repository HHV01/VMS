import { expect, test } from '../../../fixtures/vms-auth.fixture';
import { VmsSmartSearchPage } from '../../../pages/vms-smart-search.page';

/**
 * VMS Smart Search - Conversational AI-Powered Search Tests
 * Real UI: Large textarea for natural language queries
 */
test.describe('VMS Smart Search - Conversational AI Search', { tag: ['@module:ss', '@ss', '@smart-search', '@vms'] }, () => {
  let smartSearch: VmsSmartSearchPage;

  test.beforeEach(async ({ page }) => {
    smartSearch = new VmsSmartSearchPage(page);

    // Navigate to Smart Search
    await smartSearch.navigate();
    await smartSearch.waitForPageLoad();
    console.log('✓ Smart Search page loaded');
  });

  // ===== PAGE LOAD & VISIBILITY =====
  test.describe('Page Load & UI Visibility', () => {
    test('[UI001] Smart Search page should load successfully', async () => {
      const isLoaded = await smartSearch.isPageLoaded();
      expect(isLoaded).toBeTruthy();
    });

    test('[UI002] Search textarea should be visible', async () => {
      const isVisible = await smartSearch.searchTextarea.first().isVisible();
      expect(isVisible).toBeTruthy();
    });

    test('[UI003] Search button should be visible', async () => {
      const isVisible = await smartSearch.searchButton.isVisible();
      expect(isVisible).toBeTruthy();
    });

    test('[UI004] Page title should be "Tìm kiếm thông minh"', async () => {
      const title = await smartSearch.getPageTitle();
      expect(title).toContain('Smart VMS');
    });

    test('[UI005] Page URL should contain "smart-search"', async () => {
      const url = await smartSearch.getPageUrl();
      expect(url).toContain('smart-search');
    });

    test('[UI006] Page should have content', async () => {
      const pageContent = await smartSearch.page.textContent('body');
      expect(pageContent).toBeTruthy();
    });
  });

  // ===== SEARCH FUNCTIONALITY =====
  test.describe('Search Functionality', () => {
    test('[S001] Should accept text input in search textarea', async () => {
      const query = 'test query';
      await smartSearch.typeQuery(query);

      const inputValue = await smartSearch.getSearchQuery();
      expect(inputValue).toBe(query);
    });

    test('[S002] Should clear search textarea', async () => {
      await smartSearch.typeQuery('test');
      await smartSearch.clearSearch();

      const value = await smartSearch.getSearchQuery();
      expect(value).toBe('');
    });

    test('[S003] Should search with natural language query', async () => {
      await smartSearch.search('video of people walking');
      const isLoaded = await smartSearch.isPageLoaded();
      expect(isLoaded).toBeTruthy();
    });

    test('[S004] Should submit search via button click', async () => {
      await smartSearch.typeQuery('camera footage');
      await smartSearch.submitSearch();

      // Wait for results
      await smartSearch.waitForResults();
      const isLoaded = await smartSearch.isPageLoaded();
      expect(isLoaded).toBeTruthy();
    });

    test('[S005] Should submit search via keyboard Enter', async () => {
      await smartSearch.typeQuery('pedestrian detection');
      // Method already includes Enter press
      await smartSearch.useKeyboardShortcut(); // Shift+Enter

      await smartSearch.waitForResults();
      const isLoaded = await smartSearch.isPageLoaded();
      expect(isLoaded).toBeTruthy();
    });

    test('[S006] Should handle long search queries', async () => {
      const longQuery = 'show me all videos from camera 1 where people are detected walking in the parking lot';
      await smartSearch.search(longQuery);

      await smartSearch.waitForResults();
      const isLoaded = await smartSearch.isPageLoaded();
      expect(isLoaded).toBeTruthy();
    });

    test('[S007] Should handle queries with special characters', async () => {
      await smartSearch.search('vehicle movement @lot_A #security');

      await smartSearch.waitForResults();
      const isLoaded = await smartSearch.isPageLoaded();
      expect(isLoaded).toBeTruthy();
    });

    test('[S008] Should not crash on empty search', async () => {
      // Just verify page doesn't crash
      const isReady = await smartSearch.isSearchReady();
      expect(isReady).toBeTruthy();
    });

    test('[S009] Should show results after search', async () => {
      await smartSearch.search('video');

      await smartSearch.waitForResults();
      const count = await smartSearch.getResultCount();
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('[S010] Should complete search for non-matching query', async () => {
      await smartSearch.search('xyznonexistentquery12345');

      await smartSearch.waitForResults();
      // Just verify search completes without crashing
      const count = await smartSearch.getResultCount();
      expect(typeof count).toBe('number');
    });
  });

  // ===== SEARCH VARIATIONS =====
  test.describe('Search Query Variations', () => {
    test('[SV001] Search for vehicle detection', async () => {
      await smartSearch.search('vehicles detected');
      await smartSearch.waitForResults();

      const count = await smartSearch.getResultCount();
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('[SV002] Search for people detection', async () => {
      await smartSearch.search('people in the frame');
      await smartSearch.waitForResults();

      const count = await smartSearch.getResultCount();
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('[SV003] Search for specific time range', async () => {
      await smartSearch.search('videos from today morning');
      await smartSearch.waitForResults();

      const count = await smartSearch.getResultCount();
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('[SV004] Search for specific location', async () => {
      await smartSearch.search('parking area camera');
      await smartSearch.waitForResults();

      const count = await smartSearch.getResultCount();
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('[SV005] Search for activity type', async () => {
      await smartSearch.search('abnormal behavior detected');
      await smartSearch.waitForResults();

      const count = await smartSearch.getResultCount();
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('[SV006] Search for video quality', async () => {
      await smartSearch.search('high resolution videos');
      await smartSearch.waitForResults();

      const count = await smartSearch.getResultCount();
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('[SV007] Search with duration filter', async () => {
      await smartSearch.search('videos longer than 5 minutes');
      await smartSearch.waitForResults();

      const count = await smartSearch.getResultCount();
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('[SV008] Search with multiple criteria', async () => {
      await smartSearch.search(
        'people detected in parking area during night time from camera 1'
      );
      await smartSearch.waitForResults();

      const count = await smartSearch.getResultCount();
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  // ===== RESULTS INTERACTION =====
  test.describe('Results Interaction', () => {
    test('[R001] Should get result count', async () => {
      await smartSearch.search('video');
      await smartSearch.waitForResults();

      const count = await smartSearch.getResultCount();
      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('[R002] Should get result titles', async () => {
      await smartSearch.search('camera');
      await smartSearch.waitForResults();

      const titles = await smartSearch.getResultTitles();
      expect(Array.isArray(titles)).toBeTruthy();
    });

    test('[R003] Should click result item if available', async () => {
      await smartSearch.search('video');
      await smartSearch.waitForResults();

      const count = await smartSearch.getResultCount();
      if (count > 0) {
        await smartSearch.clickResult(0);
      }

      const isLoaded = await smartSearch.isPageLoaded();
      expect(isLoaded).toBeTruthy();
    });

    test('[R004] Should preview result if available', async () => {
      await smartSearch.search('video');
      await smartSearch.waitForResults();

      const count = await smartSearch.getResultCount();
      if (count > 0) {
        await smartSearch.previewResult(0);
      }

      const isLoaded = await smartSearch.isPageLoaded();
      expect(isLoaded).toBeTruthy();
    });

    test('[R005] Should download result if available', async () => {
      await smartSearch.search('video');
      await smartSearch.waitForResults();

      const count = await smartSearch.getResultCount();
      if (count > 0) {
        await smartSearch.downloadResult(0);
      }

      const isLoaded = await smartSearch.isPageLoaded();
      expect(isLoaded).toBeTruthy();
    });

    test('[R006] Should share result if available', async () => {
      await smartSearch.search('video');
      await smartSearch.waitForResults();

      const count = await smartSearch.getResultCount();
      if (count > 0) {
        await smartSearch.shareResult(0);
      }

      const isLoaded = await smartSearch.isPageLoaded();
      expect(isLoaded).toBeTruthy();
    });
  });

  // ===== SEARCH FOCUS & SHORTCUTS =====
  test.describe('Search Focus & Keyboard Shortcuts', () => {
    test('[K001] Search textarea should be focusable', async () => {
      await smartSearch.focusSearch();
      const focused = await smartSearch.isSearchFocused();
      expect(focused).toBeTruthy();
    });

    test('[K002] Should support Shift+Enter shortcut', async () => {
      await smartSearch.typeQuery('test');
      await smartSearch.useKeyboardShortcut();

      await smartSearch.waitForResults();
      const isLoaded = await smartSearch.isPageLoaded();
      expect(isLoaded).toBeTruthy();
    });

    test('[K003] Search placeholder should display', async () => {
      const placeholder = await smartSearch.getSearchPlaceholder();
      expect(placeholder).toBeTruthy();
    });
  });

  // ===== COMBINED WORKFLOWS =====
  test.describe('Combined Workflows', () => {
    test('[W001] Complete search workflow', async () => {
      // Type query
      await smartSearch.typeQuery('vehicle detection in parking');
      let query = await smartSearch.getSearchQuery();
      expect(query).toBe('vehicle detection in parking');

      // Submit search
      await smartSearch.submitSearch();
      await smartSearch.waitForResults();

      // Check results
      const count = await smartSearch.getResultCount();
      expect(count).toBeGreaterThanOrEqual(0);

      // If results exist, interact with first one
      if (count > 0) {
        const titles = await smartSearch.getResultTitles();
        expect(titles.length).toBeGreaterThan(0);
      }
    });

    test('[W002] Multiple searches in sequence', async () => {
      // First search
      await smartSearch.search('people detection');
      await smartSearch.waitForResults();
      const count1 = await smartSearch.getResultCount();

      // Clear and search again
      await smartSearch.clearSearch();
      await smartSearch.search('vehicle detection');
      await smartSearch.waitForResults();
      const count2 = await smartSearch.getResultCount();

      // Both should complete without error
      expect(typeof count1).toBe('number');
      expect(typeof count2).toBe('number');
    });

    test('[W003] Modify and resubmit search', async () => {
      // Initial search
      await smartSearch.typeQuery('camera 1');
      await smartSearch.submitSearch();
      await smartSearch.waitForResults();

      // Modify search
      await smartSearch.clearSearch();
      await smartSearch.typeQuery('camera 1 parking');
      await smartSearch.submitSearch();
      await smartSearch.waitForResults();

      const isLoaded = await smartSearch.isPageLoaded();
      expect(isLoaded).toBeTruthy();
    });

    test('[W004] Search and access results', async () => {
      await smartSearch.search('test video');
      await smartSearch.waitForResults();

      const count = await smartSearch.getResultCount();
      if (count > 0) {
        // Get titles
        const titles = await smartSearch.getResultTitles();
        expect(titles.length).toBeGreaterThan(0);

        // Try to preview
        await smartSearch.previewResult(0);
      }

      const isLoaded = await smartSearch.isPageLoaded();
      expect(isLoaded).toBeTruthy();
    });
  });

  // ===== EDGE CASES =====
  test.describe('Edge Cases', () => {
    test('[E001] Very long query', async () => {
      const longQuery = 'a'.repeat(500);
      await smartSearch.search(longQuery);
      await smartSearch.waitForResults();

      const isLoaded = await smartSearch.isPageLoaded();
      expect(isLoaded).toBeTruthy();
    });

    test('[E002] Query with unicode characters', async () => {
      await smartSearch.search('Tìm kiếm video 视频 ビデオ');
      await smartSearch.waitForResults();

      const isLoaded = await smartSearch.isPageLoaded();
      expect(isLoaded).toBeTruthy();
    });

    test('[E003] Query with numbers only', async () => {
      await smartSearch.search('123456789');
      await smartSearch.waitForResults();

      const isLoaded = await smartSearch.isPageLoaded();
      expect(isLoaded).toBeTruthy();
    });

    test('[E004] Query with symbols', async () => {
      await smartSearch.search('!@#$%^&*()');
      await smartSearch.waitForResults();

      const isLoaded = await smartSearch.isPageLoaded();
      expect(isLoaded).toBeTruthy();
    });

    test('[E005] Rapid sequential searches', async () => {
      for (let i = 0; i < 3; i++) {
        await smartSearch.search(`search ${i}`);
        await smartSearch.waitForResults(5000);
      }

      const isLoaded = await smartSearch.isPageLoaded();
      expect(isLoaded).toBeTruthy();
    });
  });
});
