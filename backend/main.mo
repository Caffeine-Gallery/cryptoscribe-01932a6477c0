import Int "mo:base/Int";

import HashMap "mo:base/HashMap";
import Hash "mo:base/Hash";
import Nat "mo:base/Nat";
import Time "mo:base/Time";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import Text "mo:base/Text";
import Option "mo:base/Option";

actor {
    // Post type definition
    public type Post = {
        id: Nat;
        title: Text;
        body: Text;
        author: Text;
        timestamp: Int;
    };

    private stable var nextId : Nat = 0;
    private stable var postEntries : [(Nat, Post)] = [];
    
    private var posts = HashMap.HashMap<Nat, Post>(0, Nat.equal, Hash.hash);

    // Initialize posts from stable storage after upgrade
    system func postupgrade() {
        posts := HashMap.fromIter<Nat, Post>(postEntries.vals(), 0, Nat.equal, Hash.hash);
    };

    // Save posts to stable storage before upgrade
    system func preupgrade() {
        postEntries := Iter.toArray(posts.entries());
    };

    // Create a new post
    public func createPost(title: Text, body: Text, author: Text) : async Post {
        let post : Post = {
            id = nextId;
            title = title;
            body = body;
            author = author;
            timestamp = Time.now();
        };
        posts.put(nextId, post);
        nextId += 1;
        post
    };

    // Get all posts in reverse chronological order
    public query func getAllPosts() : async [Post] {
        var allPosts = Iter.toArray(posts.vals());
        Array.sort(allPosts, func(a: Post, b: Post) : {#less; #equal; #greater} {
            if (a.timestamp > b.timestamp) { #less }
            else if (a.timestamp < b.timestamp) { #greater }
            else { #equal }
        })
    };
}
