import {Component, field, defaults, List} from "xenon";
import Hits from "../../../src/components/search/hits/page-objects/Hits.ts";
import Searchbox from "../../../src/components/search/search-box/page-objects/SearchBox.ts";
import RefinementListFilter from "../../../src/components/search/filters/refinement-list-filter/page-objects/RefinementListFilter.ts";
import HitsStats from "../../../src/components/search/hits-stats/page-objects/HitsStats.ts";

class Hit extends Component {

  @field(Component, {qa:"title"})
  title:Component

}

@defaults({qa:"hits", itemQA:"hit", itemType:Hit})
class MovieHits extends List<Hit> {

}

class SearchPage extends Component {

  @field(MovieHits)
  hits:MovieHits

  @field(Searchbox)
  searchbox:Searchbox

  @field(HitsStats)
  hitStats:HitsStats

  @field(RefinementListFilter, {id:"actors"})
  actorsFilter:RefinementListFilter
}

describe("example", () => {

  beforeEach(() => {
    this.searchPage = new SearchPage();
    browser.get("http://localhost:8080/test/e2e/movie-app");
  })

  it("should show hits", () => {
    expect(this.searchPage.hits.isVisible(20000)).toBe(true);
    expect(this.searchPage.hits.count()).toBe(10)
  })

  it("should find matrix", () => {
    this.searchPage.searchbox.query.type("matrix")
    browser.sleep(100)
    expect(this.searchPage.searchbox.loader.isNotVisible()).toBe(true)
    expect(this.searchPage.hits.get(0).isVisible()).toBe(true)
    expect(this.searchPage.hits.get(0).title.getText()).toBe("The Matrix")
    expect(this.searchPage.hits.count()).toBe(3)
    expect(this.searchPage.hitStats.info.getText()).toBe("3 results found")
  })

  it("should refine actors", () => {
    expect(this.searchPage.actorsFilter.isVisible()).toBe(true)
    var firstOption = this.searchPage.actorsFilter.options.get(0);
    expect(this.searchPage.actorsFilter.options.count()).toBe(10)
    expect(firstOption.label.getText()).toBe("Naveen Andrews")
    firstOption.click()

    expect(this.searchPage.searchbox.loader.isNotVisible()).toBe(true)

    var firstHit = this.searchPage.hits.get(0)
    expect(firstHit.isVisible()).toBe(true)
    expect(firstHit.title.getText()).toBe("Lost")

    var secondOption = this.searchPage.actorsFilter.options.get(1);
    expect(secondOption.label.getText()).toBe("Emilie de Ravin")
    secondOption.click()
    expect(this.searchPage.searchbox.loader.isNotVisible()).toBe(true)
    firstHit = this.searchPage.hits.get(0)
    expect(firstHit.isVisible()).toBe(true)
    expect(firstHit.title.getText()).toBe("Confirmed Dead")

    this.searchPage.actorsFilter.options.get(0).click()
    expect(this.searchPage.searchbox.loader.isNotVisible()).toBe(true)
    firstHit = this.searchPage.hits.get(0)
    expect(firstHit.title.getText()).toBe("Lost")
    expect(this.searchPage.hitStats.info.getText()).toBe("73 results found")
  })

})