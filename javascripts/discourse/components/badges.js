import Component from "@ember/component";
import CardContentsBase from "discourse/mixins/card-contents-base";
import User from "discourse/models/user";

export default Component.extend({
    classNameBindings: [
    "visible:show",
    "showBadges",
  ],
  
  init() {
    this._super(...arguments);
    @discourseComputed("user.badge_count", "user.featured_user_badges.length")
    moreBadgesCount: (badgeCount, badgeLength) => badgeCount - badgeLength,
  }
})
