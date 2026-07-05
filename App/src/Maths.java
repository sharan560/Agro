import java.util.HashMap;
import java.util.Map;
import java.util.Scanner;

public class Maths {

    public static void main(String[] args) {

        Map<String, Integer> mp = new HashMap<>();
        Scanner sc = new Scanner(System.in);

        // Input
        for (int i = 0; i < 5; i++) {
            String s = sc.nextLine();
            mp.put(s, s.length());
        }
        // Output
        for (Map.Entry<String, Integer> entry : mp.entrySet()) {
            System.out.println(entry.getKey() + " -> " + entry.getValue());
        }

        sc.close();
    }



    public int getValue(int a) {
        return a;
    }
}