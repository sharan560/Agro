import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;

//TIP To <b>Run</b> code, press <shortcut actionId="Run"/> or
// click the <icon src="AllIcons.Actions.Execute"/> icon in the gutter.
public class Main {
    public static void main(String[] args) {

        List<Integer> l=new ArrayList<>();
        l.add(1);
        l.add(2);
        l.add(3);
        l.add(4);
        System.out.println(l.get(0));

        Scanner sc=new Scanner(System.in);
        int a=sc.nextInt();
        l.add(a);
        l.remove(0);
        System.out.println(l);
        for(Integer b : l)
        {
            System.out.println(b);
        }

        Maths ms=new Maths();

        ms.getValue(a);



    }
}